// js/foros.js

let forosData = [
    {
        id: 1,
        categoria: "Salarios y Prestaciones",
        colorCat: "indigo",
        titulo: "¿Cuál es el rango salarial actual para un Desarrollador Mid-Level trabajando remoto desde El Salvador?",
        descripcion: "Hola colegas, estoy en proceso de entrevistas con dos empresas regionales en modalidad remota y me gustaría conocer sus experiencias actuales con rangos salariales y prestaciones.",
        autor: "Ing. Diego Arévalo",
        tiempo: "Hace 3 horas",
        respuestas: [
            { autor: "Andrea Morales", rol: "Tech Recruiter", tiempo: "Hace 2 horas", mensaje: "Para un perfil Mid-Level con buen nivel de inglés, las bandas actuales oscilan entre $1,600 y $2,400 USD mensuales según el stack tecnológico." },
            { autor: "Carlos Ernesto Rivas", rol: "Desarrollador", tiempo: "Hace 1 hora", mensaje: "Totalmente de acuerdo. Te recomiendo también preguntar si ofrecen estipendio de internet y seguro médico privado." }
        ]
    },
    {
        id: 2,
        categoria: "Primer Empleo",
        colorCat: "purple",
        titulo: "Consejos para conseguir el primer empleo o pasantía en Ingeniería sin experiencia previa",
        descripcion: "Estoy por egresar de la Facultad de Ingeniería y Arquitectura. ¿Qué proyectos o certificaciones recomiendan incluir en el CV para destacar?",
        autor: "Kevin Hernández (Estudiante 5° Año)",
        tiempo: "Ayer",
        respuestas: [
            { autor: "Ana Sofía", rol: "Project Manager", tiempo: "Hace 12 horas", mensaje: "Armar un portafolio en GitHub con 2 o 3 proyectos bien documentados vale más que muchos cursos básicos." }
        ]
    }
];

function renderizarListaForos() {
    const contenedor = document.getElementById('contenedor-temas');
    if(!contenedor) return;
    contenedor.innerHTML = '';

    forosData.forEach(foro => {
        let catBg = foro.colorCat === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                    foro.colorCat === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

        contenedor.innerHTML += `
            <div onclick="abrirHilo(${foro.id})" class="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-amber-500/50 transition cursor-pointer group">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start space-x-4">
                        <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-md border ${catBg}">${foro.categoria}</span>
                            <h3 class="text-lg font-bold text-white group-hover:text-amber-400 transition mt-2">${foro.titulo}</h3>
                            <p class="text-xs text-slate-400 mt-2 line-clamp-1">${foro.descripcion}</p>
                            <div class="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                                <span><i class="fa-solid fa-user-pen mr-1"></i> Por ${foro.autor}</span>
                                <span><i class="fa-regular fa-clock mr-1"></i> ${foro.tiempo}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-center shrink-0 bg-slate-800/50 rounded-lg p-2 border border-slate-700 min-w-[70px]">
                        <span class="block text-lg font-bold text-amber-500">${foro.respuestas.length}</span>
                        <span class="text-[10px] text-slate-400 uppercase font-bold">Respuestas</span>
                    </div>
                </div>
            </div>
        `;
    });
}

let hiloActivoId = null;
function abrirHilo(id) {
    hiloActivoId = id;
    const foro = forosData.find(f => f.id === id);
    if(!foro) return;

    document.getElementById('vista-lista-foros').classList.add('hidden');
    document.getElementById('vista-detalle-foro').classList.remove('hidden');
    
    document.getElementById('detalle-categoria').innerText = foro.categoria;
    document.getElementById('detalle-titulo').innerText = foro.titulo;
    document.getElementById('detalle-descripcion').innerText = foro.descripcion;
    document.getElementById('detalle-autor').innerText = foro.autor;
    document.getElementById('detalle-tiempo').innerText = foro.tiempo;

    renderizarRespuestas(foro);
    window.scrollTo(0, 0);
}

function renderizarRespuestas(foro) {
    const contenedor = document.getElementById('contenedor-respuestas');
    document.getElementById('contador-respuestas').innerText = `Respuestas de la Comunidad (${foro.respuestas.length})`;
    contenedor.innerHTML = '';

    if(foro.respuestas.length === 0) {
        contenedor.innerHTML = `<p class="text-sm text-slate-500 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">Sé el primero en responder a este tema.</p>`;
        return;
    }

    foro.respuestas.forEach((resp) => {
        contenedor.innerHTML += `
            <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative group">
                <button onclick="reportarContenido('Respuesta de ${resp.autor}')" class="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition" title="Reportar"><i class="fa-solid fa-flag"></i></button>
                <div class="flex items-center justify-between mb-3 pr-8">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-white text-sm">${resp.autor}</span>
                        <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">${resp.rol}</span>
                    </div>
                    <span class="text-[10px] text-slate-500"><i class="fa-regular fa-clock mr-1"></i>${resp.tiempo}</span>
                </div>
                <p class="text-slate-300 text-sm leading-relaxed">${resp.mensaje}</p>
            </div>
        `;
    });
}

function volverALista() {
    document.getElementById('vista-detalle-foro').classList.add('hidden');
    document.getElementById('vista-lista-foros').classList.remove('hidden');
    hiloActivoId = null;
}

function enviarRespuesta() {
    if (!localStorage.getItem('usuario_rol')) {
        alert("Debes iniciar sesión para participar.");
        window.location.href = 'registro.html';
        return;
    }
    const input = document.getElementById('input-respuesta');
    const texto = input.value.trim();
    if (!texto) return alert("Escribe un mensaje.");

    const foro = forosData.find(f => f.id === hiloActivoId);
    if (foro) {
        foro.respuestas.push({
            autor: localStorage.getItem('candidato_nombre') || 'Usuario',
            rol: 'Candidato',
            tiempo: 'Hace un momento',
            mensaje: texto
        });
        input.value = '';
        renderizarRespuestas(foro);
        alert('Respuesta publicada.');
    }
}

function reportarContenido(elemento) {
    if(confirm(`¿Reportar este contenido (${elemento}) por violar las normas?`)) {
        alert('Reporte enviado a moderación.');
    }
}

function irAMiPanel() {
    const rol = localStorage.getItem('usuario_rol');
    if (rol === 'empresa') window.location.href = 'empresa.html';
    else if (rol === 'admin') window.location.href = 'admin.html';
    else window.location.href = 'usuario.html';
}
document.addEventListener('DOMContentLoaded', renderizarListaForos);