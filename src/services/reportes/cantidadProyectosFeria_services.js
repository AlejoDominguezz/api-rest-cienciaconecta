export const formatearSalida_cantProyectosFeria = (cantidad) => {

    const labels = cantidad.map(item => item.feria);
    const data = cantidad.map(item => item.proyectos);

    
    const datasets = { 
        label: `Cantidad de Proyectos Inscriptos por Feria`,
        data,
    
    };

    return { labels, datasets };
}