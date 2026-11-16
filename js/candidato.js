// js/candidato.js

// 1. PROTECCIÓN DE RUTA
function protegerRutaCandidato() {
    if (localStorage.getItem('usuario_rol') !== 'candidato') {
        alert("Acceso denegado. Inicia sesión como Candidato.");
        window.location.href = 'index.html';
    }
}

// 2. INICIALIZAR DATOS POR DEFECTO (Si es la primera vez que entra)
if (!localStorage.getItem('candidato_nombre')) {
    localStorage.setItem('candidato_nombre', 'Carlos Rivas');
    localStorage.setItem('candidato_cv', 'CV_Carlos_Rivas_Inicial.pdf');
    localStorage.setItem('candidato_skills', JSON.stringify([
        { nombre: "JavaScript", nivel: 80 },
        { nombre: "HTML/CSS", nivel: 90 }
    ]));
}

// 3. FUNCIONES PARA EL CV (cv.html)
function guardarCV(e) {
    e.preventDefault();
    const fileInput = document.getElementById('cv-file');
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        localStorage.setItem('candidato_cv', fileName);
        alert("Currículum actualizado: " + fileName);
    } else {
        alert("Por favor selecciona un archivo.");
    }
}

// 4. FUNCIONES PARA HABILIDADES (habilidades.html)
function renderizarHabilidades() {
    const contenedor = document.getElementById('lista-habilidades');
    if(!contenedor) return;

    const skills = JSON.parse(localStorage.getItem('candidato_skills')) || [];
    contenedor.innerHTML = '';

    skills.forEach((skill, index) => {
        contenedor.innerHTML += `
            <div class="mb-4 bg-white p-4 rounded-xl border border-slate-200">
                <div class="flex justify-between text-sm font-bold text-slate-700 mb-1">
                    <span>${skill.nombre}</span>
                    <span>${skill.nivel}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${skill.nivel}%"></div>
                </div>
                <button onclick="eliminarHabilidad(${index})" class="text-rose-500 text-xs mt-2 hover:underline">Eliminar</button>
            </div>
        `;
    });
}

function agregarHabilidad(e) {
    e.preventDefault();
    const nombre = document.getElementById('skill-nombre').value;
    const nivel = document.getElementById('skill-nivel').value;

    let skills = JSON.parse(localStorage.getItem('candidato_skills')) || [];
    skills.push({ nombre, nivel: Number(nivel) });
    localStorage.setItem('candidato_skills', JSON.stringify(skills));
    
    document.getElementById('form-skill').reset();
    renderizarHabilidades();
}

function eliminarHabilidad(index) {
    let skills = JSON.parse(localStorage.getItem('candidato_skills')) || [];
    skills.splice(index, 1);
    localStorage.setItem('candidato_skills', JSON.stringify(skills));
    renderizarHabilidades();
}