const API_FOROS = 'http://localhost:4000/api/foros';
let forosDisponibles = [];
let categoriaForoActiva = '';
let hiloActivoId = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-crear-foro')?.addEventListener('click', crearNuevoTema);
    document.getElementById('btn-volver-foros')?.addEventListener('click', volverALista);
    document.getElementById('btn-reportar-tema')?.addEventListener('click', () => reportarContenido('el tema'));
    document.getElementById('btn-enviar-respuesta')?.addEventListener('click', enviarRespuesta);

    document.querySelectorAll('[data-foro-filter]').forEach(boton => {
        boton.addEventListener('click', () => {
            categoriaForoActiva = boton.dataset.foroFilter;
            renderizarListaForos();
        });
    });

    cargarForos();
});

function leerUsuarioForo() {
    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión activa del foro:', error);
    }

    return {
        id: usuarioActivo?.id || localStorage.getItem('usuario_id'),
        nombre: usuarioActivo?.nombre || localStorage.getItem('usuario_nombre') || 'Usuario',
        rol: usuarioActivo?.rol || localStorage.getItem('usuario_rol')
    };
}

function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';
    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime())
        ? 'Fecha no disponible'
        : valor.toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });
}

async function cargarForos() {
    const contenedor = document.getElementById('contenedor-temas');
    if (!contenedor) return;

    try {
        const response = await fetch(API_FOROS);
        if (!response.ok) throw new Error(`El servidor respondió con HTTP ${response.status}`);
        const datos = await response.json();
        if (!Array.isArray(datos)) throw new Error('El servidor no devolvió una lista de temas.');
        forosDisponibles = datos;
        renderizarListaForos();
    } catch (error) {
        console.error('Error al cargar temas del foro:', error);
        contenedor.replaceChildren();
        const aviso = document.createElement('p');
        aviso.className = 'text-center text-rose-400 py-8';
        aviso.textContent = 'No se pudieron cargar los temas. Verifica la conexión con el servidor y que se haya creado el esquema del foro.';
        contenedor.appendChild(aviso);
    }
}

function renderizarListaForos() {
    const contenedor = document.getElementById('contenedor-temas');
    if (!contenedor) return;

    const temas = forosDisponibles.filter(foro => !categoriaForoActiva || foro.categoria === categoriaForoActiva);
    contenedor.replaceChildren();
    if (temas.length === 0) {
        const aviso = document.createElement('p');
        aviso.className = 'text-center text-slate-400 py-8';
        aviso.textContent = 'No hay temas en esta categoría.';
        contenedor.appendChild(aviso);
        return;
    }

    temas.forEach(foro => {
        const tarjeta = document.createElement('article');
        tarjeta.tabIndex = 0;
        tarjeta.setAttribute('role', 'button');
        tarjeta.className = 'bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-amber-500/50 transition cursor-pointer group';
        tarjeta.addEventListener('click', () => abrirHilo(foro.id_foro));
        tarjeta.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                abrirHilo(foro.id_foro);
            }
        });

        const contenido = document.createElement('div');
        contenido.className = 'flex items-start justify-between gap-4';
        const detalle = document.createElement('div');
        detalle.className = 'flex items-start space-x-4';
        const icono = document.createElement('div');
        icono.className = 'w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0';
        const iconoUsuario = document.createElement('i');
        iconoUsuario.className = 'fa-solid fa-user';
        icono.appendChild(iconoUsuario);

        const texto = document.createElement('div');
        const categoria = document.createElement('span');
        categoria.className = 'text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-md border bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        categoria.textContent = foro.categoria || 'General';
        const titulo = document.createElement('h3');
        titulo.className = 'text-lg font-bold text-white group-hover:text-amber-400 transition mt-2';
        titulo.textContent = foro.titulo || 'Tema sin título';
        const descripcion = document.createElement('p');
        descripcion.className = 'text-xs text-slate-400 mt-2 line-clamp-1';
        descripcion.textContent = foro.descripcion || '';
        const metadata = document.createElement('div');
        metadata.className = 'flex items-center space-x-4 mt-3 text-xs text-slate-500';
        const autor = document.createElement('span');
        autor.textContent = `Por ${foro.autor || 'Usuario'}`;
        const fecha = document.createElement('span');
        fecha.textContent = formatearFecha(foro.fecha_creacion);
        metadata.append(autor, fecha);
        texto.append(categoria, titulo, descripcion, metadata);
        detalle.append(icono, texto);

        const contador = document.createElement('div');
        contador.className = 'text-center shrink-0 bg-slate-800/50 rounded-lg p-2 border border-slate-700 min-w-[70px]';
        const numero = document.createElement('span');
        numero.className = 'block text-lg font-bold text-amber-500';
        numero.textContent = String(Number(foro.respuestas_count) || 0);
        const etiqueta = document.createElement('span');
        etiqueta.className = 'text-[10px] text-slate-400 uppercase font-bold';
        etiqueta.textContent = 'Respuestas';
        contador.append(numero, etiqueta);
        contenido.append(detalle, contador);
        tarjeta.appendChild(contenido);
        contenedor.appendChild(tarjeta);
    });
}

async function abrirHilo(idForo) {
    try {
        const response = await fetch(`${API_FOROS}/${encodeURIComponent(idForo)}`);
        if (!response.ok) throw new Error(`El servidor respondió con HTTP ${response.status}`);
        const foro = await response.json();
        hiloActivoId = foro.id_foro;

        document.getElementById('detalle-categoria').textContent = foro.categoria || 'General';
        document.getElementById('detalle-titulo').textContent = foro.titulo || 'Tema sin título';
        document.getElementById('detalle-descripcion').textContent = foro.descripcion || '';
        document.getElementById('detalle-autor').textContent = foro.autor || 'Usuario';
        document.getElementById('detalle-tiempo').textContent = formatearFecha(foro.fecha_creacion);
        renderizarRespuestas(foro.respuestas || []);

        document.getElementById('vista-lista-foros').classList.add('hidden');
        document.getElementById('vista-detalle-foro').classList.remove('hidden');
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error al cargar el tema:', error);
        await Swal.fire({
            title: 'No se pudo abrir el tema',
            text: 'Inténtalo de nuevo más tarde.',
            icon: 'error'
        });
    }
}

function renderizarRespuestas(respuestas) {
    const contenedor = document.getElementById('contenedor-respuestas');
    const contador = document.getElementById('contador-respuestas');
    if (!contenedor || !contador) return;

    contador.textContent = `Respuestas de la Comunidad (${respuestas.length})`;
    contenedor.replaceChildren();
    if (respuestas.length === 0) {
        const aviso = document.createElement('p');
        aviso.className = 'text-sm text-slate-500 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center';
        aviso.textContent = 'Sé el primero en responder a este tema.';
        contenedor.appendChild(aviso);
        return;
    }

    respuestas.forEach(respuesta => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative group';
        const encabezado = document.createElement('div');
        encabezado.className = 'flex items-center justify-between mb-3 pr-8';
        const autor = document.createElement('span');
        autor.className = 'font-bold text-white text-sm';
        autor.textContent = respuesta.autor || 'Usuario';
        const rol = document.createElement('span');
        rol.className = 'text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700';
        rol.textContent = respuesta.rol || 'Usuario';
        const autorDetalle = document.createElement('div');
        autorDetalle.className = 'flex items-center space-x-2';
        autorDetalle.append(autor, rol);

        const fecha = document.createElement('span');
        fecha.className = 'text-[10px] text-slate-500';
        fecha.textContent = formatearFecha(respuesta.fecha_creacion);
        encabezado.append(autorDetalle, fecha);
        const mensaje = document.createElement('p');
        mensaje.className = 'text-slate-300 text-sm leading-relaxed';
        mensaje.textContent = respuesta.mensaje || '';
        tarjeta.append(encabezado, mensaje);
        contenedor.appendChild(tarjeta);
    });
}

function volverALista() {
    document.getElementById('vista-detalle-foro').classList.add('hidden');
    document.getElementById('vista-lista-foros').classList.remove('hidden');
    hiloActivoId = null;
}

async function crearNuevoTema() {
    const usuario = leerUsuarioForo();
    if (!usuario.id || !usuario.rol) {
        await Swal.fire({
            title: 'Inicia sesión para continuar',
            text: 'Debes iniciar sesión para crear un tema.',
            icon: 'warning'
        });
        window.location.href = 'registro.html';
        return;
    }

    const resultado = await Swal.fire({
        title: 'Crear nuevo tema',
        html: `
            <input id="foro-titulo" class="swal2-input" maxlength="160" placeholder="Título del tema">
            <select id="foro-categoria" class="swal2-select">
                <option value="Tecnología y Software">Tecnología y Software</option>
                <option value="Trabajo Remoto">Trabajo Remoto</option>
                <option value="Salarios y Prestaciones">Salarios y Prestaciones</option>
                <option value="Primer Empleo">Primer Empleo</option>
            </select>
            <textarea id="foro-descripcion" class="swal2-textarea" maxlength="3000" placeholder="Describe tu tema"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Publicar tema',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const titulo = document.getElementById('foro-titulo').value.trim();
            const categoria = document.getElementById('foro-categoria').value;
            const descripcion = document.getElementById('foro-descripcion').value.trim();
            if (!titulo || !descripcion) {
                Swal.showValidationMessage('Completa el título y la descripción.');
                return false;
            }
            return { titulo, categoria, descripcion };
        }
    });
    if (!resultado.isConfirmed) return;

    try {
        const response = await fetch(API_FOROS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                ...resultado.value
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `El servidor respondió con HTTP ${response.status}`);

        categoriaForoActiva = '';
        await Swal.fire({
            title: 'Tema publicado',
            text: 'Tu tema ya está disponible en el foro.',
            icon: 'success'
        });
        await cargarForos();
    } catch (error) {
        console.error('Error al crear el tema:', error);
        await Swal.fire({
            title: 'No se pudo crear el tema',
            text: error.message || 'Revisa la conexión con el servidor.',
            icon: 'error'
        });
    }
}

async function enviarRespuesta() {
    const usuario = leerUsuarioForo();
    if (!usuario.id || !usuario.rol) {
        await Swal.fire({
            title: 'Inicia sesión para participar',
            text: 'Debes iniciar sesión para responder en el foro.',
            icon: 'warning'
        });
        window.location.href = 'registro.html';
        return;
    }

    const input = document.getElementById('input-respuesta');
    const mensaje = input.value.trim();
    if (!mensaje || !hiloActivoId) {
        await Swal.fire({
            title: 'Respuesta incompleta',
            text: mensaje ? 'Abre un tema antes de responder.' : 'Escribe un mensaje antes de enviarlo.',
            icon: 'warning'
        });
        return;
    }

    try {
        const response = await fetch(`${API_FOROS}/${encodeURIComponent(hiloActivoId)}/respuestas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuario.id, mensaje })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `El servidor respondió con HTTP ${response.status}`);

        input.value = '';
        await Swal.fire({
            title: 'Respuesta publicada',
            text: 'Tu respuesta se guardó correctamente.',
            icon: 'success'
        });
        await cargarForos();
        await abrirHilo(hiloActivoId);
    } catch (error) {
        console.error('Error al publicar la respuesta:', error);
        await Swal.fire({
            title: 'No se pudo publicar la respuesta',
            text: error.message || 'Revisa la conexión con el servidor.',
            icon: 'error'
        });
    }
}

async function reportarContenido(contenido) {
    const resultado = await Swal.fire({
        title: '¿Reportar este contenido?',
        text: `¿Quieres reportar ${contenido} al administrador?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, reportar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });
    if (resultado.isConfirmed) {
        await Swal.fire({
            title: 'Moderación no configurada',
            text: 'El backend aún no tiene un servicio para guardar reportes.',
            icon: 'info'
        });
    }
}
