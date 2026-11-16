async function iniciarSesion(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            await Swal.fire({
                title: 'No se pudo iniciar sesión',
                text: data.message || 'Verifica tus credenciales e inténtalo de nuevo.',
                icon: 'error'
            });
            return;
        }

        if (!data.user) throw new Error('El servidor no devolvió los datos del usuario.');

        localStorage.setItem('usuarioActivo', JSON.stringify(data.user));
        localStorage.setItem('usuario_rol', data.user.rol);
        localStorage.setItem('usuario_nombre', data.user.nombre);
        localStorage.setItem('usuario_id', data.user.id);

        if (data.user.rol === 'admin') {
            window.location.href = 'admin.html';
        } else if (data.user.rol === 'empresa') {
            window.location.href = 'empresa.html';
        } else {
            window.location.href = 'usuario.html';
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        await Swal.fire({
            title: 'Error de conexión',
            text: 'No fue posible conectar con el servidor.',
            icon: 'error'
        });
    }
}

// 3. Función para Proteger Páginas (Guardia de Seguridad)
function protegerPagina(rolRequerido) {
    const rolActual = localStorage.getItem('usuario_rol');
    
    // Si no hay sesión o el rol no coincide, lo pateamos al index
    if (!rolActual || rolActual !== rolRequerido) {
        return Swal.fire({
            title: 'Acceso denegado',
            text: 'Debes iniciar sesión con la cuenta correcta.',
            icon: 'warning'
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    if (formLogin) formLogin.addEventListener('submit', iniciarSesion);
});