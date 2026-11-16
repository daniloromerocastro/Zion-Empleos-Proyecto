const panelesPorRol = {
    candidato: 'usuario.html',
    empresa: 'empresa.html',
    admin: 'admin.html'
};

const enlacesPorRol = {
    candidato: [
        ['Inicio', 'index.html'],
        ['Buscar Empleos', 'resultados.html'],
        ['Recursos', 'recursos.html'],
        ['Foros', 'foros.html']
    ],
    empresa: [
        ['Inicio', 'index.html'],
        ['Buscar Empleos', 'resultados.html'],
        ['Recursos', 'recursos.html'],
        ['Foros', 'foros.html']
    ],
    admin: [
        ['Inicio', 'index.html']
    ]
};

function leerSesionGlobal() {
    let usuarioActivo = null;
    const usuarioGuardado = localStorage.getItem('usuarioActivo');

    if (usuarioGuardado) {
        try {
            usuarioActivo = JSON.parse(usuarioGuardado);
        } catch (error) {
            console.error('No se pudo leer la sesión guardada:', error);
        }
    }

    const rol = localStorage.getItem('usuario_rol') || (usuarioActivo && usuarioActivo.rol);
    if (!rol || !panelesPorRol[rol]) return null;

    return {
        rol,
        id: localStorage.getItem('usuario_id') || (usuarioActivo && usuarioActivo.id),
        token: localStorage.getItem('token') || (usuarioActivo && usuarioActivo.token)
    };
}

function irAMiPanel() {
    const sesion = leerSesionGlobal();
    const destino = sesion && panelesPorRol[sesion.rol];
    window.location.href = destino || 'registro.html';
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function renderizarEnlacesNavegacion(navegacion, sesion) {
    if (!navegacion) return;
    while (navegacion.firstChild) navegacion.removeChild(navegacion.firstChild);
    if (!sesion) return;

    const pagina = window.location.pathname.toLowerCase();
    enlacesPorRol[sesion.rol].forEach(([texto, destino]) => {
        const enlace = document.createElement('a');
        enlace.href = destino;
        enlace.textContent = texto;
        enlace.className = 'px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition whitespace-nowrap';
        if (pagina.endsWith(`/${destino}`)) {
            enlace.className = 'px-3 py-2 text-amber-500 bg-slate-800 rounded-lg whitespace-nowrap';
            enlace.setAttribute('aria-current', 'page');
        }
        navegacion.appendChild(enlace);
    });
}

function actualizarEnlacesDelEncabezado(header, sesion) {
    if (!header) return;

    header.querySelectorAll('[data-nav-role], [data-requires-session]').forEach(enlace => {
        const rolRequerido = enlace.getAttribute('data-nav-role');
        const requiereSesion = enlace.hasAttribute('data-requires-session');
        const visible = (!requiereSesion || Boolean(sesion))
            && (!rolRequerido || (sesion && sesion.rol === rolRequerido));
        if (!visible) enlace.remove();
    });
}

function aplicarRestriccionesPorRol(root, sesion) {
    const alcance = root || document;
    const sesionActual = sesion === undefined ? leerSesionGlobal() : sesion;
    const elementos = [];

    if (alcance.nodeType === Node.ELEMENT_NODE && alcance.matches('[data-rol-permitido]')) {
        elementos.push(alcance);
    }
    elementos.push(...alcance.querySelectorAll('[data-rol-permitido]'));

    elementos.forEach(elemento => {
        const rolesPermitidos = elemento.getAttribute('data-rol-permitido')
            .split(',')
            .map(rol => rol.trim())
            .filter(Boolean);
        if (!sesionActual || !rolesPermitidos.includes(sesionActual.rol)) {
            elemento.remove();
        }
    });
}

window.aplicarRestriccionesPorRol = aplicarRestriccionesPorRol;

function actualizarNavegacionGlobal() {
    const sesion = leerSesionGlobal();
    const panel = sesion && panelesPorRol[sesion.rol];
    const pagina = window.location.pathname.toLowerCase();

    if (pagina.endsWith('/registro.html') && panel) {
        window.location.href = panel;
        return;
    }

    const header = document.getElementById('site-header');
    renderizarEnlacesNavegacion(
        header && header.querySelector('#site-navigation'),
        sesion
    );
    actualizarEnlacesDelEncabezado(header, sesion);
    aplicarRestriccionesPorRol(document, sesion);
    const acciones = header && header.querySelector('#session-actions');
    if (!acciones) return;

    while (acciones.firstChild) acciones.removeChild(acciones.firstChild);

    if (!panel) {
        const login = document.createElement('a');
        login.href = 'registro.html';
        login.textContent = 'Iniciar Sesión';
        login.className = 'px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition';
        acciones.appendChild(login);
        return;
    }

    const botonPanel = document.createElement('button');
    botonPanel.type = 'button';
    botonPanel.textContent = 'Mi Panel';
    botonPanel.className = 'px-4 py-2 rounded-xl text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 transition';
    botonPanel.addEventListener('click', irAMiPanel);

    const botonCerrarSesion = document.createElement('button');
    botonCerrarSesion.type = 'button';
    botonCerrarSesion.textContent = 'Cerrar Sesión';
    botonCerrarSesion.className = 'px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition';
    botonCerrarSesion.addEventListener('click', cerrarSesion);

    acciones.appendChild(botonPanel);
    acciones.appendChild(botonCerrarSesion);
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarNavegacionGlobal();
    const observadorPermisos = new MutationObserver(cambios => {
        cambios.forEach(cambio => {
            cambio.addedNodes.forEach(nodo => {
                if (nodo.nodeType === Node.ELEMENT_NODE) {
                    aplicarRestriccionesPorRol(nodo);
                }
            });
        });
    });
    observadorPermisos.observe(document.body, { childList: true, subtree: true });
});
