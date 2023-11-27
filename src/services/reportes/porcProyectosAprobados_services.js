import { capitalizarPalabras } from "../../helpers/capitalizarPalabras.js";
import { EvaluacionExposicion } from "../../models/EvaluacionExposicion.js";
import { obtenerTodasClases } from "./reportes_services.js";

export const ObtenerPorcProyectosAprobados = async (tipo, proyectosPorClase, puntaje) => {

    const resultados = [];
    
    // Obtener todas las clases de la base de datos
    const todasClases = await obtenerTodasClases(tipo);

    // Recorrer todas las clases
    for (const clase of todasClases) {
        
        let idClase = null;
        if(tipo != "departamento"){
            idClase = clase._id.toString();
        } else {
            idClase = clase;
        }

        // Obtener proyectos para la clase actual
        const proyectos = proyectosPorClase[idClase] || [];

        // Sumar puntajes de cada clase, puntaje final de exposición regional
        let sumaAprobados = 0;
        let sumaDesaprobados = 0;
        
        for (const proyecto of proyectos) {
            const evaluacion = await EvaluacionExposicion.findOne({ proyectoId: proyecto._id });
            if(evaluacion){
                    if (evaluacion.puntajeFinal >= puntaje) {
                        sumaAprobados += 1;
                    } else {
                        sumaDesaprobados += 1;
                    }
                }
        }
        

        let porcentaje = 0
        if ((sumaDesaprobados+sumaAprobados) != 0){
            porcentaje = sumaAprobados/(sumaDesaprobados+sumaAprobados) * 100;
            porcentaje = porcentaje.toFixed(2);
        }
        
        // Añadir la información de color al resultado
        let resultado = {};
        if (tipo != "departamento"){
            resultado = {
                nombre: clase.abreviatura,
                porcentaje: porcentaje.toString(),
                color: clase.color || 'Color Desconocido'
            };
        } else {
            resultado = {
                nombre: capitalizarPalabras(clase),
                porcentaje: porcentaje.toString(),
            };
        }

        resultados.push(resultado);
    }

    return resultados;
}



export const formatearSalida_porcProyectosAprobados = (tipo, porc) => {

    const labels = porc.map(item => item.nombre);
    const data = porc.map(item => item.porcentaje);
    const backgroundColor = porc.map(item => item.color);

    let datasets = {}
    if(tipo == "departamento"){
        datasets = {
            label: `Porcentaje de Proyectos Aprobados por ${tipo}`,
            data,
        };
    } else {
        datasets = {
            label: `Porcentaje de Proyectos Aprobados por ${tipo}`,
            data,
            backgroundColor
        };
    }
    return { labels, datasets };
}