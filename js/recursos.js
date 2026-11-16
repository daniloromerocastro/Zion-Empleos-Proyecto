document.addEventListener('DOMContentLoaded', () => {
    const botonesFiltro = document.querySelectorAll('[data-resource-filter]');
    const tarjetas = Array.from(document.querySelectorAll('[data-resource-card]'));
    const avisoVacio = document.getElementById('recursos-vacios');

    function filtrarRecursos(categoria) {
        let visibles = 0;
        tarjetas.forEach(tarjeta => {
            const coincide = categoria === 'all' || tarjeta.dataset.category === categoria;
            tarjeta.classList.toggle('hidden', !coincide);
            if (coincide) visibles += 1;
        });

        if (avisoVacio) avisoVacio.classList.toggle('hidden', visibles > 0);
        botonesFiltro.forEach(boton => {
            const seleccionado = boton.dataset.resourceFilter === categoria;
            boton.classList.toggle('text-amber-500', seleccionado);
            boton.classList.toggle('bg-slate-800', seleccionado);
            boton.classList.toggle('text-slate-400', !seleccionado);
            boton.classList.toggle('bg-slate-900', !seleccionado);
            boton.setAttribute('aria-pressed', String(seleccionado));
        });
    }

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => filtrarRecursos(boton.dataset.resourceFilter));
    });

    tarjetas.forEach(tarjeta => {
        const boton = tarjeta.querySelector('[data-resource-open]');
        if (!boton) return;
        boton.addEventListener('click', () => {
            const titulo = tarjeta.querySelector('h3')?.textContent?.trim() || 'Recurso';
            const descripcion = tarjeta.querySelector('p')?.textContent?.trim() || 'Sin descripción disponible.';
            Swal.fire({
                title: titulo,
                text: descripcion,
                icon: 'info',
                confirmButtonText: 'Cerrar'
            });
        });
    });

    filtrarRecursos('all');
});
