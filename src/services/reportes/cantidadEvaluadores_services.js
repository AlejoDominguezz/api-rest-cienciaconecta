export const formatearSalida_cantEvaluadores = (cantidad) => {

    const labels = cantidad.map(item => item.departamento);
    const data = cantidad.map(item => item.evaluadores);

    const datasets = { 
        label: `Cantidad de Evaluadores por Departamento`,
        data,
    
    };

    return { labels, datasets };
}