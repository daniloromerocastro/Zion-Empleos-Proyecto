document.addEventListener('DOMContentLoaded', async () => {
    if (!protegerRutaCandidato()) return;

    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión del candidato:', error);
    }

    const nombre = usuarioActivo.nombre || localStorage.getItem('usuario_nombre') || 'Candidato';
    const nombrePerfil = document.getElementById('perfil-nombre') || document.getElementById('nombre-candidato');
    if (nombrePerfil) nombrePerfil.textContent = nombre;

    const perfilCv = document.getElementById('perfil-cv');
    if (perfilCv) {
        const cvActual = localStorage.getItem('candidato_cv');
        perfilCv.textContent = cvActual ? `Archivo actual: ${cvActual}` : 'Aún no has cargado tu currículum.';
    }

    const idUsuario = usuarioActivo.id || localStorage.getItem('usuario_id');
    if (idUsuario) await cargarMisPostulaciones(idUsuario);

    const textoCv = document.getElementById('cv-actual-text');
    if (textoCv) textoCv.textContent = localStorage.getItem('candidato_cv') || 'Aún no has seleccionado un currículum.';

    const formularioCv = document.getElementById('form-cv');
    if (formularioCv) formularioCv.addEventListener('submit', guardarCV);

    const formularioHabilidades = document.getElementById('form-skill');
    if (formularioHabilidades) formularioHabilidades.addEventListener('submit', agregarHabilidad);
    renderizarHabilidades();
});

function protegerRutaCandidato() {
    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión del candidato:', error);
    }

    if (usuarioActivo && usuarioActivo.rol === 'candidato') return true;
    Swal.fire({
        title: 'Acceso denegado',
        text: 'Inicia sesión como candidato.',
        icon: 'warning'
    }).then(() => {
        window.location.href = 'registro.html';
    });
    return false;
}

async function guardarCV(event) {
    event.preventDefault();
    const archivo = document.getElementById('cv-file')?.files?.[0];
    if (!archivo) {
        await Swal.fire({
            title: 'Selecciona un archivo',
            text: 'Elige un archivo PDF antes de guardar.',
            icon: 'warning'
        });
        return;
    }
    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
        await Swal.fire({
            title: 'Formato no válido',
            text: 'El currículum debe estar en formato PDF.',
            icon: 'warning'
        });
        return;
    }

    try {
        localStorage.setItem('candidato_cv', archivo.name);
        const texto = document.getElementById('cv-actual-text');
        if (texto) texto.textContent = archivo.name;
        await Swal.fire({
            title: 'Referencia guardada',
            text: 'Se guardó el nombre del archivo en este navegador; el PDF todavía no se envía al servidor.',
            icon: 'info'
        });
    } catch (error) {
        console.error('No se pudo guardar la referencia del CV:', error);
        await Swal.fire({
            title: 'No se pudo guardar',
            text: 'El navegador no permitió guardar la referencia del archivo.',
            icon: 'error'
        });
    }
}

function leerHabilidades() {
    const guardadas = localStorage.getItem('candidato_habilidades');
    if (!guardadas) return [];
    try {
        const habilidades = JSON.parse(guardadas);
        if (!Array.isArray(habilidades)) throw new Error('El formato de habilidades no es válido.');
        return habilidades;
    } catch (error) {
        console.error('No se pudieron leer las habilidades guardadas:', error);
        Swal.fire({
            title: 'No se pudieron cargar las habilidades',
            text: 'Los datos guardados en este navegador están dañados.',
            icon: 'error'
        });
        return [];
    }
}

function renderizarHabilidades() {
    const contenedor = document.getElementById('lista-habilidades');
    if (!contenedor) return;
    contenedor.replaceChildren();

    const habilidades = leerHabilidades();
    if (habilidades.length === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'text-sm text-slate-400';
        vacio.textContent = 'Aún no has agregado habilidades.';
        contenedor.appendChild(vacio);
        return;
    }

    habilidades.forEach(habilidad => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'mb-5';
        const encabezado = document.createElement('div');
        encabezado.className = 'flex items-center justify-between mb-2';
        const nombre = document.createElement('span');
        nombre.className = 'font-bold text-white';
        nombre.textContent = habilidad.nombre;
        const nivel = document.createElement('span');
        nivel.className = 'text-xs text-amber-400 font-bold';
        nivel.textContent = `${habilidad.nivel}%`;
        encabezado.append(nombre, nivel);

        const barra = document.createElement('div');
        barra.className = 'h-2 bg-slate-800 rounded-full overflow-hidden';
        const progreso = document.createElement('div');
        progreso.className = 'h-full bg-amber-500 rounded-full';
        progreso.style.width = `${Math.max(1, Math.min(100, Number(habilidad.nivel) || 0))}%`;
        barra.appendChild(progreso);

        const eliminar = document.createElement('button');
        eliminar.type = 'button';
        eliminar.className = 'mt-2 text-xs text-rose-400 hover:text-rose-300';
        eliminar.textContent = 'Eliminar habilidad';
        eliminar.addEventListener('click', () => eliminarHabilidad(habilidad.id));
        tarjeta.append(encabezado, barra, eliminar);
        contenedor.appendChild(tarjeta);
    });
}

async function agregarHabilidad(event) {
    event.preventDefault();
    const campoNombre = document.getElementById('skill-nombre');
    const campoNivel = document.getElementById('skill-nivel');
    const nombre = campoNombre.value.trim();
    const nivel = Number(campoNivel.value);
    if (!nombre || !Number.isInteger(nivel) || nivel < 1 || nivel > 100) {
        await Swal.fire({
            title: 'Datos inválidos',
            text: 'Indica una habilidad y un nivel entre 1 y 100.',
            icon: 'warning'
        });
        return;
    }

    const habilidades = leerHabilidades();
    if (habilidades.some(habilidad => habilidad.nombre.toLowerCase() === nombre.toLowerCase())) {
        await Swal.fire({
            title: 'Habilidad repetida',
            text: 'Esa habilidad ya está en tu lista.',
            icon: 'warning'
        });
        return;
    }

    habilidades.push({ id: Date.now(), nombre, nivel });
    try {
        localStorage.setItem('candidato_habilidades', JSON.stringify(habilidades));
        event.target.reset();
        renderizarHabilidades();
        await Swal.fire({
            title: 'Habilidad añadida',
            text: 'La habilidad se guardó en este navegador.',
            icon: 'success'
        });
    } catch (error) {
        console.error('No se pudo guardar la habilidad:', error);
        await Swal.fire({
            title: 'No se pudo guardar',
            text: 'El navegador no permitió guardar la habilidad.',
            icon: 'error'
        });
    }
}

async function eliminarHabilidad(id) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar esta habilidad?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) return;

    const habilidades = leerHabilidades().filter(habilidad => habilidad.id !== id);
    try {
        localStorage.setItem('candidato_habilidades', JSON.stringify(habilidades));
        renderizarHabilidades();
    } catch (error) {
        console.error('No se pudo eliminar la habilidad:', error);
        await Swal.fire({
            title: 'No se pudo eliminar',
            text: 'El navegador no permitió actualizar la lista.',
            icon: 'error'
        });
    }
}

async function cargarMisPostulaciones(idUsuario) {
    const contenedor = document.getElementById('tabla-postulaciones');
    if (!contenedor) return;

    contenedor.innerHTML = '<p class="text-sm text-slate-400 text-center p-4">Cargando tus postulaciones...</p>';

    try {
        const response = await fetch(`http://localhost:4000/api/postulaciones/usuario/${encodeURIComponent(idUsuario)}`);
        if (!response.ok) {
            throw new Error(`El servidor respondió con HTTP ${response.status}`);
        }

        const postulaciones = await response.json();
        if (!Array.isArray(postulaciones)) {
            throw new Error('El servidor no devolvió una lista de postulaciones.');
        }

        if (postulaciones.length === 0) {
            contenedor.innerHTML = '<p class="text-sm text-slate-500 bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">Aún no te has postulado a ninguna vacante.</p>';
            return;
        }

        const clasesEstado = {
            Contratado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Rechazado: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            Entrevista: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
        contenedor.replaceChildren();

        postulaciones.forEach(postulacion => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl';

            const detalles = document.createElement('div');
            const titulo = document.createElement('h3');
            titulo.className = 'font-bold text-white';
            titulo.textContent = postulacion.titulo || 'Vacante';

            const informacion = document.createElement('p');
            informacion.className = 'text-xs text-slate-400 mt-1';
            const fecha = postulacion.fecha_postulacion
                ? new Date(postulacion.fecha_postulacion).toLocaleDateString('es-SV')
                : 'Fecha no disponible';
            informacion.textContent = `${postulacion.razon_social || 'Empresa'} • Enviado el ${fecha}`;

            const estado = document.createElement('span');
            estado.className = `px-3 py-1 rounded-full border font-bold text-xs ${clasesEstado[postulacion.estado] || 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`;
            estado.textContent = postulacion.estado || 'Pendiente';

            detalles.append(titulo, informacion);
            tarjeta.append(detalles, estado);
            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
        contenedor.innerHTML = '<p class="text-sm text-rose-400 bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">No se pudieron cargar tus postulaciones. Inténtalo más tarde.</p>';
    }
}
