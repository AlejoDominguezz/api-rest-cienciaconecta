export const formatearSalida_cantProyectosFeria = (cantidad) => {

    const labels = cantidad.map(item => item.feria);
    const data = cantidad.map(item => item.proyectos);

    
    const datasets = { 
        label: `Cantidad de Proyectos Inscriptos por Feria`,
        data,
        borderColor: 'rgb(0, 172, 230)',
        backgroundColor: 'rgba(0, 172, 230, 0.6)',
        fill: true
    
    };

    return { labels, datasets };
}