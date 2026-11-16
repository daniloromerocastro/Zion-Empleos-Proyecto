// js/auth.js

// 1. Función para Iniciar Sesión (Simulada)
function loginSimulado(rol) {
    // Guardamos el rol en el navegador. 
    // Roles válidos: 'candidato', 'empresa', 'admin'
    localStorage.setItem('usuario_rol', rol);
    localStorage.setItem('usuario_nombre', 'Usuario Demo'); // Puedes capturar el nombre del input

    // Redirigir según el rol
    if (rol === 'candidato') {
        window.location.href = 'usuario.html';
    } else if (rol === 'empresa') {
        window.location.href = 'empresa.html';
    } else if (rol === 'admin') {
        window.location.href = 'admin.html';
    }
}

// 2. Función para Cerrar Sesión
function cerrarSesion() {
    localStorage.removeItem('usuario_rol');
    localStorage.removeItem('usuario_nombre');
    window.location.href = 'index.html';
}

// 3. Función para Proteger Páginas (Guardia de Seguridad)
function protegerPagina(rolRequerido) {
    const rolActual = localStorage.getItem('usuario_rol');
    
    // Si no hay sesión o el rol no coincide, lo pateamos al index
    if (!rolActual || rolActual !== rolRequerido) {
        alert("Acceso denegado. Debes iniciar sesión con la cuenta correcta.");
        window.location.href = 'index.html';
    }
}

// 4. Función para actualizar el Header (El menú de arriba)
function actualizarHeader() {
    const rol = localStorage.getItem('usuario_rol');
    const btnLogin = document.getElementById('btn-login-header'); // Tendrás que darle este ID a tu botón de login
    const btnLogout = document.getElementById('btn-logout-header'); // ID para el botón de salir
    
    if (rol) {
        // Si está logueado, ocultamos el botón de login y mostramos el de logout
        if(btnLogin) btnLogin.classList.add('hidden');
        if(btnLogout) {
            btnLogout.classList.remove('hidden');
            btnLogout.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión`;
        }
    } else {
        // Si no está logueado, mostramos login y ocultamos logout
        if(btnLogin) btnLogin.classList.remove('hidden');
        if(btnLogout) btnLogout.classList.add('hidden');
    }
}

// Ejecutar la actualización del header cuando cargue cualquier página
document.addEventListener('DOMContentLoaded', actualizarHeader);