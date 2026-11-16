// js/busqueda.js

// 1. DATOS SIMULADOS POR DEFECTO
const empleosPorDefecto = [
    { 
        id: 1, 
        titulo: "Desarrollador Full-Stack Senior (React & Node.js)", 
        empresa: "NovaTech Solutions S.A. de C.V.", 
        verificada: true,
        ubicacion: "San Salvador", 
        modalidad: "Híbrido", 
        salario: 2400, 
        exp: "Senior (5+ años)", 
        sector: "Tecnología y Software", 
        contrato: "Tiempo Completo",
        fecha: "Hace 2 horas",
        desc: "Liderar el diseño y construcción de microservicios financieros y portales transaccionales de alto tráfico para clientes bancarios regionales.",
        reqs: ["Ingeniería en Sistemas o Ciencias de la Computación", "4+ años con React, TypeScript y Node.js", "Experiencia en bases de datos PostgreSQL y AWS", "Inglés técnico intermedio-avanzado"],
        beneficios: ["Seguro médico y de vida privado al 100%", "Bono anual por cumplimiento de metas", "2 días de teletrabajo por semana", "Capacitaciones pagadas en AWS y Scrum"],
        contacto: "talento@novatech.com.sv",
        sede: "San Salvador",
        web: "www.novatech.com.sv"
    },
    { 
        id: 2, 
        titulo: "Diseñador de Producto UI/UX & Design Systems", 
        empresa: "PixelCraft Studio", 
        verificada: true,
        ubicacion: "Remoto Regional", 
        modalidad: "Remoto", 
        salario: 1850, 
        exp: "Mid-Level (2-4 años)", 
        sector: "Diseño y Creatividad", 
        contrato: "Tiempo Completo",
        fecha: "Hace 1 día",
        desc: "Crear y mantener nuestro sistema de diseño, diseñar flujos de usuario y prototipos interactivos para plataformas SaaS.",
        reqs: ["Portafolio demostrable en UI/UX", "Dominio de Figma y Adobe XD", "Experiencia creando Design Systems desde cero"],
        beneficios: ["Trabajo 100% remoto", "Horarios flexibles", "Presupuesto anual para hardware"],
        contacto: "jobs@pixelcraft.io",
        sede: "Remoto",
        web: "www.pixelcraft.io"
    }
];

// 2. OBTENER TODOS LOS EMPLEOS (Por defecto + Publicados por Empresas)
function obtenerTodosLosEmpleos() {
    const guardadas = JSON.parse(localStorage.getItem('vacantes_publicadas')) || [];
    return [...guardadas, ...empleosPorDefecto];
}

// 3. RENDERIZAR RESULTADOS (resultados.html)
function renderizarEmpleos(filtros = {}) {
    const contenedor = document.getElementById('contenedor-empleos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    let resultados = obtenerTodosLosEmpleos();

    // Aplicar filtros
    if (filtros.keyword) {
        const kw = filtros.keyword.toLowerCase();
        resultados = resultados.filter(e => e.titulo.toLowerCase().includes(kw) || e.empresa.toLowerCase().includes(kw));
    }
    if (filtros.ubicacion) resultados = resultados.filter(e => e.ubicacion === filtros.ubicacion);
    if (filtros.modalidad) resultados = resultados.filter(e => e.modalidad === filtros.modalidad);
    if (filtros.exp) resultados = resultados.filter(e => e.exp === filtros.exp);
    if (filtros.salario) resultados = resultados.filter(e => e.salario >= Number(filtros.salario));
    if (filtros.sector) resultados = resultados.filter(e => e.sector === filtros.sector);

    const contador = document.getElementById('contador-resultados');
    if (contador) contador.innerText = `Mostrando ${resultados.length} vacantes disponibles`;

    if (resultados.length === 0) {
        contenedor.innerHTML = `<div class="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800"><p class="text-slate-400 font-medium">No se encontraron vacantes con esos filtros.</p></div>`;
        return;
    }

    // Dibujar tarjetas
    resultados.forEach(empleo => {
        const verificadaIcon = empleo.verificada ? `<i class="fa-solid fa-circle-check text-emerald-500 ml-1" title="Empresa Verificada"></i>` : '';
        
        contenedor.innerHTML += `
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg hover:border-amber-500/50 transition mb-4">
                <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div class="flex-grow">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="px-2 py-0.5 bg-slate-800 text-amber-500 text-[10px] font-bold rounded-md uppercase tracking-wide">${empleo.modalidad}</span>
                            <span class="text-[11px] text-slate-500"><i class="fa-regular fa-clock mr-1"></i>${empleo.fecha}</span>
                            <span class="text-[11px] text-indigo-400 font-semibold">${empleo.sector}</span>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-1">${empleo.titulo}</h3>
                        <p class="text-sm text-slate-400 font-medium mb-3"><i class="fa-solid fa-building mr-1"></i> ${empleo.empresa} ${verificadaIcon}</p>
                        
                        <div class="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                            <span><i class="fa-solid fa-location-dot mr-1 text-slate-500"></i> ${empleo.ubicacion}</span>
                            <span><i class="fa-solid fa-briefcase mr-1 text-slate-500"></i> ${empleo.exp}</span>
                            <span class="text-emerald-400 font-bold"><i class="fa-solid fa-money-bill-wave mr-1"></i> $${empleo.salario.toLocaleString()} USD / mes</span>
                        </div>
                    </div>
                    <div class="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <a href="detalle_empleo.html?id=${empleo.id}" class="inline-block w-full text-center px-6 py-2.5 bg-slate-800 text-amber-500 font-bold text-sm rounded-xl hover:bg-amber-500 hover:text-slate-900 transition border border-slate-700">Ver Detalle / Aplicar</a>
                    </div>
                </div>
            </div>
        `;
    });
}

// 4. APLICAR FILTROS Y LIMPIAR
function aplicarFiltros(e) {
    if(e) e.preventDefault();
    const expRadio = document.querySelector('input[name="filtro-exp"]:checked');
    const filtros = {
        keyword: document.getElementById('filtro-keyword')?.value || '',
        ubicacion: document.getElementById('filtro-ubicacion')?.value || '',
        modalidad: document.getElementById('filtro-modalidad')?.value || '',
        exp: expRadio ? expRadio.value : '',
        salario: document.getElementById('filtro-salario')?.value || '',
        sector: document.getElementById('filtro-sector')?.value || ''
    };
    renderizarEmpleos(filtros);
}

function limpiarFiltros() {
    document.getElementById('form-filtros').reset();
    document.getElementById('filtro-keyword').value = '';
    document.getElementById('sal-val').innerText = '$0';
    renderizarEmpleos();
}

// 5. CARGAR DETALLE DEL EMPLEO (detalle_empleo.html)
function cargarDetalleEmpleo() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    
    // Buscamos en TODOS los empleos (incluyendo los nuevos)
    const todos = obtenerTodosLosEmpleos();
    const empleo = todos.find(e => e.id === id) || todos[0]; // Si no lo encuentra, muestra el primero por defecto

    if (!empleo) {
        window.location.href = 'resultados.html';
        return;
    }

    document.getElementById('det-titulo').innerText = empleo.titulo;
    document.getElementById('det-empresa').innerText = empleo.empresa;
    document.getElementById('det-modalidad').innerText = empleo.modalidad;
    document.getElementById('det-sector').innerText = empleo.sector;
    document.getElementById('det-salario').innerText = "$" + empleo.salario.toLocaleString();
    document.getElementById('det-contrato').innerText = empleo.contrato;
    document.getElementById('det-desc').innerText = empleo.desc;
    document.getElementById('det-contacto').innerText = empleo.contacto;
    document.getElementById('det-sede').innerText = empleo.sede;
    document.getElementById('det-web').innerText = empleo.web;
    document.getElementById('det-empresa-ficha').innerText = empleo.empresa;
    
    // Requisitos (Lista con checks azules)
    const reqsList = document.getElementById('det-reqs-list');
    reqsList.innerHTML = '';
    if (empleo.reqs) {
        empleo.reqs.forEach(r => {
            reqsList.innerHTML += `<li class="flex items-start mb-2"><i class="fa-solid fa-check text-blue-500 mt-1 mr-2"></i><span>${r}</span></li>`;
        });
    }

    // Beneficios (Lista con iconos amarillos)
    const benList = document.getElementById('det-beneficios-list');
    benList.innerHTML = '';
    if (empleo.beneficios) {
        empleo.beneficios.forEach(b => {
            benList.innerHTML += `<li class="flex items-start mb-2"><i class="fa-solid fa-gift text-amber-500 mt-1 mr-2"></i><span>${b}</span></li>`;
        });
    }

    // Configurar botones de postulación
    document.getElementById('btn-postular').onclick = () => postularse(empleo);
    document.getElementById('btn-postular-2').onclick = () => postularse(empleo);
}

// 6. POSTULARSE
function postularse(empleo) {
    if (localStorage.getItem('usuario_rol') !== 'candidato') {
        alert("Debes iniciar sesión como Candidato para postularte a esta vacante.");
        window.location.href = 'registro.html';
        return;
    }

    let postulaciones = JSON.parse(localStorage.getItem('candidato_postulaciones')) || [];
    
    if (postulaciones.some(p => p.id === empleo.id)) {
        alert("Ya te has postulado a esta vacante anteriormente. Revisa tu panel.");
        return;
    }

    postulaciones.push({
        id: empleo.id,
        titulo: empleo.titulo,
        empresa: empleo.empresa,
        estado: "En Revisión",
        fecha: new Date().toLocaleDateString()
    });

    localStorage.setItem('candidato_postulaciones', JSON.stringify(postulaciones));
    alert("¡Postulación enviada con éxito! Revisa el estado en tu panel.");
    window.location.href = 'usuario.html';
}