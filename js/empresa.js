// js/empresa.js

// 1. PROTECCIÓN DE RUTA
const rolActual = localStorage.getItem('usuario_rol');
if (rolActual !== 'empresa') {
    alert("Debes iniciar sesión como Empresa para ver esto.");
    window.location.href = 'index.html';
}

// 2. DATOS SIMULADOS INICIALES DE LA EMPRESA
let misVacantes = [
    { id: 1, titulo: "Desarrollador Full Stack", fecha: "2026-11-01", salario: 1800, estado: "Aprobado" },
    { id: 2, titulo: "Analista de Datos", fecha: "2026-11-05", salario: 1400, estado: "Pendiente" },
    { id: 3, titulo: "Diseñador UI/UX", fecha: "2026-10-20", salario: 1200, estado: "Rechazado" },
    { id: 4, titulo: "Soporte Técnico", fecha: "2026-09-15", salario: 800, estado: "Revocado" }
];

// 3. FUNCIÓN PARA CAMBIAR DE PESTAÑA
function switchTab(tab) {
    document.getElementById('vista-vacantes').classList.add('hidden');
    document.getElementById('vista-publicar').classList.add('hidden');
    
    document.getElementById('tab-btn-vacantes').className = "px-4 py-2 rounded-lg text-slate-400 hover:text-white transition";
    document.getElementById('tab-btn-publicar').className = "px-4 py-2 rounded-lg text-slate-400 hover:text-white transition";

    if (tab === 'vacantes') {
        document.getElementById('vista-vacantes').classList.remove('hidden');
        document.getElementById('tab-btn-vacantes').className = "px-4 py-2 rounded-lg bg-slate-700 text-amber-500 shadow-sm transition";
    } else {
        document.getElementById('vista-publicar').classList.remove('hidden');
        document.getElementById('tab-btn-publicar').className = "px-4 py-2 rounded-lg bg-slate-700 text-amber-500 shadow-sm transition";
    }
}

// 4. RENDERIZAR TABLA Y APLICAR FILTRO POR ESTADO
function renderizarVacantesEmpresa() {
    const tabla = document.getElementById('tabla-vacantes-empresa');
    if(!tabla) return;
    
    const filtro = document.getElementById('filtro-estado-vacante').value;
    tabla.innerHTML = ''; 

    // Filtrar los datos
    const vacantesFiltradas = filtro === 'Todos' 
        ? misVacantes 
        : misVacantes.filter(v => v.estado === filtro);

    if (vacantesFiltradas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">No hay vacantes con este estado.</td></tr>`;
        return;
    }

    // Dibujar filas
    vacantesFiltradas.forEach(vacante => {
        let badgeClass = "";
        if (vacante.estado === 'Aprobado') badgeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        else if (vacante.estado === 'Pendiente') badgeClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
        else if (vacante.estado === 'Rechazado') badgeClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";
        else if (vacante.estado === 'Revocado') badgeClass = "bg-slate-700 text-slate-300 border-slate-600";

        tabla.innerHTML += `
            <tr class="hover:bg-slate-800/50 transition border-b border-slate-800">
                <td class="py-4 px-4 font-bold text-white">${vacante.titulo}</td>
                <td class="py-4 px-4 text-slate-400">${vacante.fecha}</td>
                <td class="py-4 px-4 font-semibold text-slate-300">$${vacante.salario}</td>
                <td class="py-4 px-4">
                    <span class="px-2.5 py-1 text-[10px] font-bold border rounded-full ${badgeClass}">
                        ${vacante.estado}
                    </span>
                </td>
                <td class="py-4 px-4 text-right">
                    <button class="text-amber-500 hover:text-amber-400 font-bold text-xs" title="Ver detalles">Ver</button>
                </td>
            </tr>
        `;
    });
}

// 5. PUBLICAR NUEVA VACANTE Y GUARDARLA PARA EL BUSCADOR
function publicarNuevaVacante(e) {
    e.preventDefault();
    
    // Capturamos TODOS los datos del formulario
    const titulo = document.getElementById('new-title').value;
    const sector = document.getElementById('new-sector').value;
    const ubicacion = document.getElementById('new-location').value;
    const modalidad = document.getElementById('new-modality').value;
    const exp = document.getElementById('new-exp').value;
    const salario = document.getElementById('new-salary').value;
    const desc = document.getElementById('new-desc').value;
    const reqsRaw = document.getElementById('new-reqs').value; 
    const beneficiosRaw = document.getElementById('new-beneficios').value; // Asegúrate que en tu HTML el ID sea este, si no, cámbialo.
    const contacto = document.getElementById('new-contact').value;

    // Procesamos los textos separados por coma a arreglos
    const reqs = reqsRaw.split(',').map(r => r.trim());
    const beneficios = beneficiosRaw ? beneficiosRaw.split(',').map(b => b.trim()) : ["Beneficios estándar"];

    // Creamos el objeto completo
    const nuevaVacante = {
        id: Date.now(), // ID único basado en el tiempo
        titulo: titulo,
        empresa: "NovaTech Solutions S.A.", 
        verificada: true,
        ubicacion: ubicacion,
        modalidad: modalidad,
        salario: Number(salario),
        exp: exp,
        sector: sector,
        contrato: "Tiempo Completo",
        fecha: "Hace un momento",
        desc: desc,
        reqs: reqs,
        beneficios: beneficios,
        contacto: contacto,
        sede: ubicacion,
        web: "www.novatech.com.sv"
    };

    // Guardamos en localStorage para que busqueda.js lo lea
    let vacantesGlobales = JSON.parse(localStorage.getItem('vacantes_publicadas')) || [];
    vacantesGlobales.unshift(nuevaVacante);
    localStorage.setItem('vacantes_publicadas', JSON.stringify(vacantesGlobales));

    // Añadir a la tabla local de la empresa
    misVacantes.unshift({ 
        id: nuevaVacante.id, 
        titulo: titulo, 
        fecha: new Date().toISOString().split('T')[0], 
        salario: Number(salario), 
        estado: "Pendiente" 
    });
    
    alert("Vacante publicada. Ahora es visible en el buscador (en estado de prueba).");
    
    e.target.reset();
    switchTab('vacantes');
    renderizarVacantesEmpresa();
}

// 6. INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    renderizarVacantesEmpresa();
});