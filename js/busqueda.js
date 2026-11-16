// js/busqueda.js

let empleosDisponibles = [];

document.addEventListener('DOMContentLoaded', () => {
    const formularioFiltros = document.getElementById('form-filtros');
    if (formularioFiltros) {
        formularioFiltros.addEventListener('submit', aplicarFiltros);
        formularioFiltros.querySelectorAll('select, input[type="radio"], input[type="range"]').forEach(control => {
            control.addEventListener('change', aplicarFiltros);
        });
        const palabraClave = document.getElementById('filtro-keyword');
        if (palabraClave) palabraClave.addEventListener('input', aplicarFiltros);
    }

    const botonLimpiar = document.getElementById('btn-limpiar-filtros');
    if (botonLimpiar) botonLimpiar.addEventListener('click', limpiarFiltros);

    const controlSalario = document.getElementById('filtro-salario');
    if (controlSalario) {
        controlSalario.addEventListener('input', () => {
            const valor = document.getElementById('sal-val');
            if (valor) valor.textContent = `$${controlSalario.value}`;
            aplicarFiltros();
        });
    }

    const botonPostular = document.getElementById('btn-postular');
    const botonPostularSecundario = document.getElementById('btn-postular-2');
    const parametroEmpleo = new URLSearchParams(window.location.search).get('id');
    if (botonPostular) botonPostular.addEventListener('click', () => aplicarEmpleo(parametroEmpleo));
    if (botonPostularSecundario) botonPostularSecundario.addEventListener('click', () => aplicarEmpleo(parametroEmpleo));

    cargarEmpleos();
    if (document.getElementById('det-titulo')) cargarDetalleEmpleo();
});

async function cargarEmpleos() {
    const contenedor = document.getElementById('contenedor-empleos');
    if (!contenedor) return;

    contenedor.innerHTML = '<p class="text-center text-slate-500">Cargando vacantes...</p>';

    try {
        const response = await fetch('http://localhost:4000/api/empleos');
        if (!response.ok) {
            throw new Error(`El servidor respondió con HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('La respuesta del servidor no contiene una lista de empleos.');
        }

        empleosDisponibles = data;
        renderizarEmpleos();
    } catch (error) {
        console.error('Error al cargar empleos:', error);
        contenedor.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar las vacantes. Revisa la conexión con el servidor.</p>';
        actualizarContador('Error al cargar vacantes.');
    }
}

function aplicarFiltros(event) {
    if (event) event.preventDefault();
    renderizarEmpleos();
}

function limpiarFiltros() {
    const formulario = document.getElementById('form-filtros');
    if (!formulario) return;
    formulario.reset();
    const valorSalario = document.getElementById('sal-val');
    if (valorSalario) valorSalario.textContent = '$0';
    renderizarEmpleos();
}

function renderizarEmpleos() {
    const contenedor = document.getElementById('contenedor-empleos');
    const formulario = document.getElementById('form-filtros');
    if (!contenedor || !formulario) return;

    const keyword = document.getElementById('filtro-keyword').value.trim().toLowerCase();
    const ubicacion = document.getElementById('filtro-ubicacion').value;
    const sector = document.getElementById('filtro-sector').value;
    const experienciaSeleccionada = document.querySelector('input[name="filtro-exp"]:checked');
    const experiencia = experienciaSeleccionada ? experienciaSeleccionada.value : '';
    const modalidad = document.getElementById('filtro-modalidad').value;
    const salarioMinimo = Number(document.getElementById('filtro-salario').value);

    const filtrados = empleosDisponibles.filter(empleo => {
        const textoBusqueda = `${empleo.titulo || ''} ${empleo.sector || ''} ${empleo.ubicacion || ''} ${empleo.descripcion || ''}`.toLowerCase();
        return (!keyword || textoBusqueda.includes(keyword))
            && (!ubicacion || empleo.ubicacion === ubicacion)
            && (!sector || empleo.sector === sector)
            && (!experiencia || empleo.experiencia === experiencia)
            && (!modalidad || empleo.modalidad === modalidad)
            && Number(empleo.salario || 0) >= salarioMinimo;
    });

    actualizarContador(`${filtrados.length} vacante${filtrados.length === 1 ? '' : 's'} encontrada${filtrados.length === 1 ? '' : 's'}`);

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-slate-500">No hay vacantes que coincidan con los filtros seleccionados.</p>';
        return;
    }

    contenedor.replaceChildren();
    filtrados.forEach(empleo => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'job-card bg-white p-5 rounded-xl shadow-sm border border-slate-200';

        const titulo = document.createElement('h2');
        titulo.className = 'font-bold text-lg text-slate-800';
        const enlace = document.createElement('a');
        enlace.href = `detalle_empleo.html?id=${encodeURIComponent(empleo.id_empleo)}`;
        enlace.textContent = empleo.titulo || 'Vacante';
        titulo.appendChild(enlace);

        const ubicacion = document.createElement('p');
        ubicacion.className = 'text-sm text-slate-500';
        ubicacion.textContent = `${empleo.ubicacion || 'Ubicación no especificada'} | ${empleo.modalidad || 'Modalidad no especificada'}`;

        const salario = document.createElement('p');
        salario.className = 'text-emerald-600 font-semibold mt-2';
        salario.textContent = `$${empleo.salario || 0}`;

        const botonPostular = document.createElement('button');
        botonPostular.type = 'button';
        botonPostular.dataset.rolPermitido = 'candidato';
        botonPostular.className = 'mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition';
        botonPostular.textContent = 'Aplicar a este empleo';
        botonPostular.addEventListener('click', () => aplicarEmpleo(empleo.id_empleo));

        tarjeta.append(titulo, ubicacion, salario, botonPostular);
        contenedor.appendChild(tarjeta);
    });
    if (window.aplicarRestriccionesPorRol) window.aplicarRestriccionesPorRol(contenedor);
}

function actualizarContador(texto) {
    const contador = document.getElementById('contador-resultados');
    if (contador) contador.textContent = texto;
}

async function aplicarEmpleo(idEmpleo) {
    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión activa:', error);
    }
    
    if (!idEmpleo || !usuarioActivo || usuarioActivo.rol !== 'candidato') {
        await Swal.fire({
            title: idEmpleo ? 'Inicia sesión para postularte' : 'Vacante no identificada',
            text: idEmpleo
                ? 'Debes iniciar sesión como candidato para aplicar a un empleo.'
                : 'Abre esta página desde una vacante para poder postularte.',
            icon: idEmpleo ? 'warning' : 'error'
        });
        if (idEmpleo) window.location.href = 'registro.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/postulaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empleo_id: idEmpleo,
                usuario_id: usuarioActivo.id || localStorage.getItem('usuario_id')
            })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            await Swal.fire({
                title: '¡Postulación enviada!',
                text: 'Tu postulación se envió exitosamente.',
                icon: 'success'
            });
        } else {
            await Swal.fire({
                title: 'No se pudo enviar la postulación',
                text: data.message || 'Inténtalo de nuevo.',
                icon: 'warning'
            });
        }
    } catch (error) {
        console.error('Error al aplicar:', error);
        await Swal.fire({
            title: 'Error de conexión',
            text: 'Hubo un problema al enviar tu postulación.',
            icon: 'error'
        });
    }
}

async function cargarDetalleEmpleo() {
    const idEmpleo = new URLSearchParams(window.location.search).get('id');
    if (!idEmpleo) {
        await Swal.fire({
            title: 'Vacante no identificada',
            text: 'Selecciona una vacante desde la página de resultados.',
            icon: 'warning'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/empleos/${encodeURIComponent(idEmpleo)}`);
        if (!response.ok) throw new Error(`El servidor respondió con HTTP ${response.status}`);
        const empleo = await response.json();

        const establecerTexto = (id, texto) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = texto || '-';
        };
        const empresa = empleo.empresa_nombre || empleo.razon_social || (empleo.empresa_id ? `Empresa #${empleo.empresa_id}` : 'Empresa');
        establecerTexto('det-sector', empleo.sector);
        establecerTexto('det-modalidad', empleo.modalidad);
        establecerTexto('det-titulo', empleo.titulo);
        establecerTexto('det-empresa', empresa);
        establecerTexto('det-empresa-ficha', empresa);
        establecerTexto('det-salario', `$${empleo.salario || 0}`);
        establecerTexto('det-contrato', empleo.tipo_contrato);
        establecerTexto('det-desc', empleo.descripcion);
        establecerTexto('det-contacto', empleo.email_contacto || empleo.email || '-');
        establecerTexto('det-sede', empleo.ubicacion);
        establecerTexto('det-web', empleo.sitio_web);

        ['det-reqs-list', 'det-beneficios-list'].forEach((id, index) => {
            const lista = document.getElementById(id);
            if (!lista) return;
            const contenido = index === 0 ? empleo.requisitos : empleo.beneficios;
            lista.replaceChildren();
            String(contenido || '').split(/[,\n]/).map(item => item.trim()).filter(Boolean).forEach(item => {
                const fila = document.createElement('li');
                fila.className = 'mb-2';
                fila.textContent = item;
                lista.appendChild(fila);
            });
        });
    } catch (error) {
        console.error('Error al cargar el detalle de la vacante:', error);
        await Swal.fire({
            title: 'No se pudo cargar la vacante',
            text: 'Revisa la conexión con el servidor e inténtalo de nuevo.',
            icon: 'error'
        });
    }
}