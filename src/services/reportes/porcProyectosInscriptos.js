export const porcProyectos = (cantProyectos) => {

    // Calcular el total de la cantidad de proyectos
    const totalProyectos = cantProyectos.reduce((total, proyecto) => total + parseInt(proyecto.cantidad), 0);

    // Actualizar el atributo "porcentaje" en cada objeto del array
    cantProyectos.forEach(proyecto => {
        const cantidad = parseInt(proyecto.cantidad);
        const porcentaje = totalProyectos !== 0 ? (cantidad / totalProyectos) * 100 : 0;
        proyecto.porcentaje = porcentaje.toFixed(2); 
    });

    return cantProyectos;
}



export const formatearSalida_porcProyectosInscriptos = (tipo, porc) => {

    const labels = porc.map(item => item.nombre);
    const data = porc.map(item => item.porcentaje);
    const backgroundColor = porc.map(item => item.color);

    let datasets = {}
    if(tipo == "departamento"){
        datasets = {
            label: `Porcentaje de Proyectos Inscriptos por ${tipo}`,
            data,
        };
    } else {
        datasets = {
            label: `Porcentaje de Proyectos Inscriptos por ${tipo}`,
            data,
            backgroundColor
        };
    }
   

    return { labels, datasets };
}