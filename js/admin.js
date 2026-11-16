// js/admin.js
if (localStorage.getItem('usuario_rol') !== 'admin') {
    alert("Acceso denegado. Área exclusiva de administradores.");
    window.location.href = 'index.html';
}

let empresasGlobales = [
    { id: 1, nombre: "NovaTech Solutions", nit: "0614-180915-102-4", rep: "Roberto Salaverria", email: "rrhh@novatech.com", estado: "Aprobada" },
    { id: 2, nombre: "Inversiones Financieras S.A.", nit: "0614-200520-101-5", rep: "Ana Gómez", email: "contacto@invfin.com", estado: "Pendiente" },
    { id: 3, nombre: "Constructora El Sol", nit: "0614-100810-103-2", rep: "Luis Pérez", email: "info@elsol.com", estado: "En Observación" },
    { id: 4, nombre: "Fake Data Corp", nit: "0000-000000-000-0", rep: "Desconocido", email: "fake@fake.com", estado: "Rechazada" }
];

let vacantesGlobales = [
    { id: 1, titulo: "Desarrollador Full Stack", empresa: "NovaTech Solutions", estado: "Aprobado" },
    { id: 2, titulo: "Analista de Datos", empresa: "NovaTech Solutions", estado: "Pendiente" },
    { id: 3, titulo: "Gerente de Ventas", empresa: "Inversiones Financieras S.A.", estado: "Pendiente" }
];

let empresaAuditandoId = null;

function switchAdminTab(tab) {
    ['companies', 'users', 'vacancies', 'moderation', 'stats'].forEach(t => {
        document.getElementById(`admin-subview-${t}`).classList.add('hidden');
        document.getElementById(`atab-${t}`).className = "px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition";
    });
    document.getElementById(`admin-subview-${tab}`).classList.remove('hidden');
    document.getElementById(`atab-${tab}`).className = "px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold transition";
    
    if(tab === 'companies') renderizarEmpresasAdmin();
    if(tab === 'vacancies') renderizarVacantesAdmin();
}

function renderizarEmpresasAdmin() {
    const tbody = document.getElementById('admin-companies-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    empresasGlobales.forEach(emp => {
        let badge = emp.estado === 'Aprobada' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    emp.estado === 'Pendiente' ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    emp.estado === 'En Observación' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                    "bg-rose-500/20 text-rose-400 border-rose-500/30";

        tbody.innerHTML += `
            <tr class="hover:bg-slate-800/50 transition border-b border-slate-800">
                <td class="py-4 px-4 font-bold text-white">${emp.nombre}</td>
                <td class="py-4 px-4 text-slate-400 font-mono text-xs">${emp.nit}</td>
                <td class="py-4 px-4 text-slate-400">${emp.rep}</td>
                <td class="py-4 px-4"><span class="px-2.5 py-1 text-[10px] font-bold rounded-full border ${badge}">${emp.estado}</span></td>
                <td class="py-4 px-4 text-right">
                    <button onclick="abrirAuditoria(${emp.id})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs">Ver Docs</button>
                </td>
            </tr>
        `;
    });
}

function abrirAuditoria(id) {
    const emp = empresasGlobales.find(e => e.id === id);
    if(!emp) return;
    empresaAuditandoId = id;
    
    document.getElementById('audit-company-name').innerText = emp.nombre;
    document.getElementById('audit-company-nit').innerText = emp.nit;
    document.getElementById('audit-company-rep').innerText = emp.rep;
    document.getElementById('audit-company-email').innerText = emp.email;
    
    const badge = document.getElementById('audit-company-status-badge');
    badge.innerText = emp.estado;
    badge.className = emp.estado === 'Aprobada' ? "inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400" :
                      emp.estado === 'Rechazada' ? "inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400" :
                      "inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400";

    document.getElementById('modal-admin-docs').classList.remove('hidden');
}

function updateCompanyAuditStatus(nuevoEstado) {
    const emp = empresasGlobales.find(e => e.id === empresaAuditandoId);
    if(emp) {
        emp.estado = nuevoEstado;
        renderizarEmpresasAdmin();
        document.getElementById('modal-admin-docs').classList.add('hidden');
        alert(`Empresa ${emp.nombre} actualizada a: ${nuevoEstado}`);
    }
}

function renderizarVacantesAdmin() {
    const tbody = document.getElementById('admin-vacancies-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    vacantesGlobales.forEach(vac => {
        let badge = vac.estado === 'Aprobado' ? "bg-emerald-500/20 text-emerald-400" :
                    vac.estado === 'Pendiente' ? "bg-amber-500/20 text-amber-400" :
                    "bg-rose-500/20 text-rose-400";

        tbody.innerHTML += `
            <tr class="hover:bg-slate-800/50 border-b border-slate-800">
                <td class="py-4 px-4 font-bold text-white">${vac.titulo}</td>
                <td class="py-4 px-4 text-slate-400">${vac.empresa}</td>
                <td class="py-4 px-4"><span class="px-2 py-1 text-[10px] font-bold rounded-full ${badge}">${vac.estado}</span></td>
                <td class="py-4 px-4 text-right space-x-2">
                    <button onclick="cambiarEstadoVacante(${vac.id}, 'Aprobado')" class="text-emerald-400 font-bold hover:underline">Aprobar</button>
                    <button onclick="cambiarEstadoVacante(${vac.id}, 'Rechazado')" class="text-rose-400 font-bold hover:underline">Rechazar</button>
                </td>
            </tr>
        `;
    });
}

function cambiarEstadoVacante(id, nuevoEstado) {
    const vac = vacantesGlobales.find(v => v.id === id);
    if(vac) {
        vac.estado = nuevoEstado;
        renderizarVacantesAdmin();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarEmpresasAdmin();
    renderizarVacantesAdmin();
});