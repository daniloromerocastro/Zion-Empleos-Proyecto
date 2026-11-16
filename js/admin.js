const API_ADMIN = 'http://localhost:4000/api';
let empresasAuditables = [];
let empresaSeleccionadaId = null;

document.addEventListener('DOMContentLoaded', async () => {
    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión administrativa:', error);
    }

    if (!usuarioActivo || usuarioActivo.rol !== 'admin') {
        await Swal.fire({
            title: 'Acceso restringido',
            text: 'Esta sección es solo para administradores.',
            icon: 'warning'
        });
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('btn-cerrar-auditoria')?.addEventListener('click', cerrarAuditoriaEmpresa);
    document.getElementById('modal-admin-docs')?.addEventListener('click', event => {
        if (event.target.id === 'modal-admin-docs') cerrarAuditoriaEmpresa();
    });

    switchAdminTab('companies');
    await Promise.all([cargarEmpresas(), cargarVacantes()]);
});

function switchAdminTab(tab) {
    ['companies', 'vacancies', 'users'].forEach(nombre => {
        const vista = document.getElementById(`admin-subview-${nombre}`);
        const boton = document.getElementById(`atab-${nombre}`);
        if (vista) vista.classList.toggle('hidden', nombre !== tab);
        if (boton) {
            boton.classList.toggle('bg-amber-500', nombre === tab);
            boton.classList.toggle('text-slate-950', nombre === tab);
            boton.classList.toggle('bg-slate-800', nombre !== tab);
            boton.classList.toggle('text-slate-400', nombre !== tab);
        }
    });
}

async function cargarEmpresas() {
    const tabla = document.getElementById('admin-companies-tbody');
    if (!tabla) return;
    tabla.replaceChildren();

    try {
        const response = await fetch(`${API_ADMIN}/empresas`);
        if (!response.ok) throw new Error(`El servidor respondió con HTTP ${response.status}`);
        empresasAuditables = await response.json();
        if (!Array.isArray(empresasAuditables)) throw new Error('El servidor no devolvió una lista de empresas.');
        if (empresasAuditables.length === 0) {
            mostrarFilaVacia(tabla, 5, 'No hay empresas registradas.');
            return;
        }

        empresasAuditables.forEach(empresa => {
            const fila = document.createElement('tr');
            fila.className = 'border-b border-slate-800 hover:bg-slate-800/50';
            const razonSocial = empresa.razon_social || empresa.nombre || 'Sin nombre';
            const representante = empresa.representante || empresa.nombre_representante || empresa.representante_legal || '-';
            [razonSocial, empresa.nit || '-', representante].forEach(valor => {
                const celda = document.createElement('td');
                celda.className = 'py-3 px-4';
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            const estado = document.createElement('td');
            estado.className = 'py-3 px-4';
            const etiqueta = document.createElement('span');
            etiqueta.className = 'px-2 py-1 text-xs rounded font-bold';
            etiqueta.textContent = empresa.estado || 'Pendiente';
            if (empresa.estado === 'Aprobada') etiqueta.classList.add('bg-emerald-500/10', 'text-emerald-400');
            else if (empresa.estado === 'Rechazada') etiqueta.classList.add('bg-rose-500/10', 'text-rose-400');
            else etiqueta.classList.add('bg-amber-500/10', 'text-amber-400');
            estado.appendChild(etiqueta);

            const acciones = document.createElement('td');
            acciones.className = 'py-3 px-4 text-right';
            const botonAuditar = document.createElement('button');
            botonAuditar.type = 'button';
            botonAuditar.className = 'bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs';
            botonAuditar.textContent = 'Ver expediente';
            botonAuditar.addEventListener('click', () => abrirAuditoriaEmpresa(empresa.id_empresa));
            acciones.appendChild(botonAuditar);
            fila.append(estado, acciones);
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar empresas:', error);
        mostrarFilaVacia(tabla, 5, 'No se pudieron cargar las empresas. Revisa la conexión con el servidor.', true);
    }
}

async function cargarVacantes() {
    const tabla = document.getElementById('admin-vacancies-tbody');
    if (!tabla) return;
    tabla.replaceChildren();

    try {
        const response = await fetch(`${API_ADMIN}/empleos`);
        if (!response.ok) throw new Error(`El servidor respondió con HTTP ${response.status}`);
        const vacantes = await response.json();
        if (!Array.isArray(vacantes)) throw new Error('El servidor no devolvió una lista de vacantes.');
        if (vacantes.length === 0) {
            mostrarFilaVacia(tabla, 4, 'No hay vacantes registradas.');
            return;
        }

        vacantes.forEach(vacante => {
            const fila = document.createElement('tr');
            fila.className = 'border-b border-slate-800 hover:bg-slate-800/50';
            const titulo = document.createElement('td');
            titulo.className = 'py-3 px-4 font-semibold text-white';
            titulo.textContent = vacante.titulo || 'Vacante';
            const empresa = document.createElement('td');
            empresa.className = 'py-3 px-4';
            empresa.textContent = vacante.empresa_nombre || (vacante.empresa_id ? `Empresa #${vacante.empresa_id}` : 'Empresa');
            const estado = document.createElement('td');
            estado.className = 'py-3 px-4';
            estado.textContent = vacante.estado || 'Sin estado';
            const detalle = document.createElement('td');
            detalle.className = 'py-3 px-4 text-right';
            const enlace = document.createElement('a');
            enlace.className = 'text-amber-400 hover:underline';
            enlace.href = `detalle_empleo.html?id=${encodeURIComponent(vacante.id_empleo)}`;
            enlace.textContent = 'Ver vacante';
            detalle.appendChild(enlace);
            fila.append(titulo, empresa, estado, detalle);
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar vacantes del panel:', error);
        mostrarFilaVacia(tabla, 4, 'No se pudieron cargar las vacantes.', true);
    }
}

function mostrarFilaVacia(tabla, columnas, mensaje, esError) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.className = `py-8 text-center ${esError ? 'text-rose-400' : 'text-slate-400'}`;
    celda.textContent = mensaje;
    fila.appendChild(celda);
    tabla.appendChild(fila);
}

function abrirAuditoriaEmpresa(idEmpresa) {
    const empresa = empresasAuditables.find(item => Number(item.id_empresa) === Number(idEmpresa));
    if (!empresa) return;
    empresaSeleccionadaId = empresa.id_empresa;

    document.getElementById('audit-company-name').textContent = empresa.razon_social || empresa.nombre || 'Empresa';
    document.getElementById('audit-company-nit').textContent = empresa.nit || '-';
    document.getElementById('audit-company-rep').textContent = empresa.representante || empresa.nombre_representante || empresa.representante_legal || '-';
    document.getElementById('audit-company-email').textContent = empresa.email || empresa.correo || empresa.email_contacto || '-';
    document.getElementById('audit-company-status-badge').textContent = empresa.estado || 'Pendiente';
    document.getElementById('modal-admin-docs').classList.remove('hidden');
}

function cerrarAuditoriaEmpresa() {
    document.getElementById('modal-admin-docs')?.classList.add('hidden');
    empresaSeleccionadaId = null;
}

async function updateCompanyAuditStatus(nuevoEstado) {
    if (!empresaSeleccionadaId) return;
    const confirmacion = await Swal.fire({
        title: `¿Marcar la empresa como ${nuevoEstado}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });
    if (!confirmacion.isConfirmed) return;

    try {
        const response = await fetch(`${API_ADMIN}/empresas/${encodeURIComponent(empresaSeleccionadaId)}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || `El servidor respondió con HTTP ${response.status}`);

        cerrarAuditoriaEmpresa();
        await cargarEmpresas();
        await Swal.fire({
            title: 'Estado actualizado',
            text: `La empresa ahora figura como ${nuevoEstado}.`,
            icon: 'success'
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la empresa:', error);
        await Swal.fire({
            title: 'No se pudo actualizar',
            text: error.message || 'Revisa la conexión con el servidor.',
            icon: 'error'
        });
    }
}
