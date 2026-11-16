// 1. PROTECCIÓN DE RUTA (Se mantiene igual, asumiendo que auth.js guarda esto)
const rolActual = JSON.parse(localStorage.getItem('usuarioActivo'))?.rol;
if (rolActual !== 'empresa') {
    Swal.fire({
        title: 'Acceso restringido',
        text: 'Debes iniciar sesión como empresa para ver esta sección.',
        icon: 'warning'
    }).then(() => {
        window.location.href = 'index.html';
    });
}

// 2. FUNCIÓN PARA CAMBIAR DE PESTAÑA (Se mantiene el diseño de tu compañero)
function switchTab(tab) {
    const vistas = {
        vacantes: document.getElementById('vista-vacantes'),
        publicar: document.getElementById('vista-publicar')
    };
    const botones = {
        vacantes: document.getElementById('tab-btn-vacantes'),
        publicar: document.getElementById('tab-btn-publicar')
    };
    Object.values(vistas).forEach(vista => vista?.classList.add('hidden'));
    Object.values(botones).forEach(boton => {
        if (boton) boton.className = 'px-4 py-2 rounded-lg text-slate-400 hover:text-white transition';
    });

    if (tab === 'vacantes') {
        vistas.vacantes?.classList.remove('hidden');
        if (botones.vacantes) botones.vacantes.className = 'px-4 py-2 rounded-lg bg-slate-700 text-amber-500 shadow-sm transition';
        renderizarVacantesEmpresa(); // Recarga los datos al volver a la pestaña
    } else if (tab === 'publicar') {
        vistas.publicar?.classList.remove('hidden');
        if (botones.publicar) botones.publicar.className = 'px-4 py-2 rounded-lg bg-slate-700 text-amber-500 shadow-sm transition';
    }
}

// 3. RENDERIZAR TABLA DE VACANTES (CONECTADO AL BACKEND)
async function renderizarVacantesEmpresa() {
    const tabla = document.getElementById('tabla-vacantes-empresa');
    if(!tabla) return;
    
    const filtro = document.getElementById('filtro-estado-vacante').value;
    tabla.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500">Cargando vacantes...</td></tr>'; 

    try {
        // En una app real, enviarías el ID de la empresa logueada. 
        // Aquí asumimos una ruta que trae los empleos de la BD.
        const response = await fetch('http://localhost:4000/api/empleos'); 
        const empleosBD = await response.json();

        // Filtrar los datos
        const vacantesFiltradas = filtro === 'Todos' 
            ? empleosBD 
            : empleosBD.filter(v => v.estado === filtro);

        if (vacantesFiltradas.length === 0) {
            tabla.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500">No hay vacantes publicadas o con este estado.</td></tr>`;
            return;
        }

        tabla.innerHTML = ''; 
        // Dibujar filas
        vacantesFiltradas.forEach(vacante => {
            let badgeClass = "";
            if (vacante.estado === 'Aprobado') badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            else if (vacante.estado === 'Pendiente') badgeClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
            else if (vacante.estado === 'Rechazado') badgeClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";
            else badgeClass = "bg-slate-700 text-slate-300 border-slate-600";

            tabla.innerHTML += `
                <tr class="hover:bg-slate-800/50 transition border-b border-slate-800">
                    <td class="py-4 px-4 font-bold text-white">${vacante.titulo}</td>
                    <td class="py-4 px-4 text-slate-400">${new Date(vacante.fecha_publicacion).toLocaleDateString()}</td>
                    <td class="py-4 px-4 font-semibold text-slate-300">$${vacante.salario}</td>
                    <td class="py-4 px-4">
                        <span class="px-2.5 py-1 text-[10px] font-bold border rounded-full ${badgeClass}">
                            ${vacante.estado}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-right">
                        <!-- REQUERIMIENTO: Inactivar/Eliminar ofertas -->
                        <button onclick="eliminarOferta(${vacante.id_empleo})" class="text-rose-500 hover:text-rose-400 font-bold text-xs ml-2">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar vacantes:", error);
        tabla.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-rose-500">Error al cargar datos del servidor.</td></tr>`;
    }
}

// 4. PUBLICAR NUEVA VACANTE (CONECTADO AL BACKEND)
async function publicarNuevaVacante(e) {
    e.preventDefault();
    
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    
    // Objeto para la base de datos según tu script SQL
    const nuevaVacante = {
        empresa_id: 1, // En un sistema real esto viene de la sesión de la empresa
        titulo: document.getElementById('new-title').value,
        sector: document.getElementById('new-sector').value,
        ubicacion: document.getElementById('new-location').value,
        modalidad: document.getElementById('new-modality').value,
        experiencia: document.getElementById('new-exp').value,
        salario: parseFloat(document.getElementById('new-salary').value),
        descripcion: document.getElementById('new-desc').value,
        requisitos: document.getElementById('new-reqs').value,
        beneficios: document.getElementById('new-beneficios').value || "Beneficios de ley"
    };

    try {
        const response = await fetch('http://localhost:4000/api/empleos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaVacante)
        });

        const data = await response.json();

        if(data.success) {
            await Swal.fire({
                title: 'Vacante publicada',
                text: 'La vacante se publicó exitosamente.',
                icon: 'success'
            });
            e.target.reset();
            switchTab('vacantes');
        } else {
            await Swal.fire({
                title: 'No se pudo publicar la vacante',
                text: data.error || 'Verifica los datos e inténtalo de nuevo.',
                icon: 'error'
            });
        }
    } catch (error) {
        console.error("Error:", error);
        await Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo guardar la vacante en el servidor.',
            icon: 'error'
        });
    }
}

// 5. CARGAR APLICANTES (CONECTADO AL BACKEND)
// REQUERIMIENTO: Empresa ve aplicantes de ofertas
async function cargarAplicantes() {
    const tabla = document.getElementById('tabla-aplicantes-empresa');
    if(!tabla) return;
    
    tabla.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-500">Buscando postulantes...</td></tr>';

    try {
        const response = await fetch('http://localhost:4000/api/postulaciones');
        const postulaciones = await response.json();

        if (postulaciones.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">No hay postulaciones nuevas.</td></tr>`;
            return;
        }

        tabla.innerHTML = '';
        postulaciones.forEach(post => {
            tabla.innerHTML += `
                <tr class="hover:bg-slate-800/50 transition border-b border-slate-800">
                    <td class="py-4 px-4 font-bold text-white">${post.candidato_nombre || 'Usuario'}</td>
                    <td class="py-4 px-4 text-slate-400">${post.titulo_empleo || 'Vacante'}</td>
                    <td class="py-4 px-4 font-semibold text-slate-300">${post.estado}</td>
                    <td class="py-4 px-4 text-right">
                        <!-- REQUERIMIENTO: Aceptar o Denegar aplicante -->
                        <button onclick="cambiarEstadoPostulante(${post.id_postulacion}, 'Contratado')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs mr-2">Aceptar</button>
                        <button onclick="cambiarEstadoPostulante(${post.id_postulacion}, 'Rechazado')" class="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-xs">Denegar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar postulaciones:", error);
        tabla.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-rose-500">Error al cargar datos del servidor.</td></tr>`;
    }
}

// 6. FUNCIONES DE ACCIÓN (CONECTADAS AL BACKEND)

// Inactivar/eliminar ofertas[cite: 7]
function eliminarOferta(idEmpleo) {
    return Swal.fire({
        title: '¿Eliminar esta oferta?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then(async (result) => {
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:4000/api/empleos/${idEmpleo}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    title: 'Oferta eliminada',
                    text: 'La oferta se eliminó correctamente.',
                    icon: 'success'
                });
                renderizarVacantesEmpresa(); // Recargar la tabla[cite: 7]
            } else {
                await Swal.fire({
                    title: 'No se pudo eliminar la oferta',
                    text: data.error || 'Inténtalo de nuevo.',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire({
                title: 'Error de conexión',
                text: 'No se pudo completar la eliminación.',
                icon: 'error'
            });
        }
        });
}

// Empresa Acepta o Deniega aplicante[cite: 7]
async function cambiarEstadoPostulante(idPostulacion, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:4000/api/postulaciones/${idPostulacion}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await Swal.fire({
                title: 'Estado actualizado',
                text: `El candidato ha sido ${nuevoEstado}.`,
                icon: 'success'
            });
            cargarAplicantes(); // Recargar la tabla[cite: 7]
        } else {
            await Swal.fire({
                title: 'No se pudo actualizar el estado',
                text: data.error || 'Inténtalo de nuevo.',
                icon: 'error'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo actualizar el estado del candidato.',
            icon: 'error'
        });
    }
}

// 7. INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    // Si tu compañero tiene un form con ID "form-publicar", le agregamos el evento
    const formPublicar = document.getElementById('form-publicar');
    if(formPublicar) {
        formPublicar.addEventListener('submit', publicarNuevaVacante);
    }

    renderizarVacantesEmpresa();
});