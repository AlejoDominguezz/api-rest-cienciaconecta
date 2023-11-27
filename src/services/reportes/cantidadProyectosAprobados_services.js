import { capitalizarPalabras } from "../../helpers/capitalizarPalabras.js";
import { EvaluacionExposicion } from "../../models/EvaluacionExposicion.js";
import { obtenerTodasClases } from "./reportes_services.js";


export const ObtenerCantProyectosAprobados = async (tipo, proyectosPorClase, puntaje, aprobado) => {

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
        
        for (const proyecto of proyectos) {
            const evaluacion = await EvaluacionExposicion.findOne({ proyectoId: proyecto._id });
            if(evaluacion){
                if(aprobado){
                    if (evaluacion.puntajeFinal >= puntaje) {
                        sumaAprobados += 1;
                    }
                } else {
                    if (evaluacion.puntajeFinal < puntaje) {
                        sumaAprobados += 1;
                    }
                }
            } 
        }


        // Añadir la información de color al resultado
        let resultado = {};
        if (tipo != "departamento"){
            resultado = {
                nombre: clase.abreviatura,
                aprobados: sumaAprobados.toString(),
                color: clase.color || 'Color Desconocido'
            };
        } else {
            resultado = {
                nombre: capitalizarPalabras(clase),
                aprobados: sumaAprobados.toString(),
            };
        }

        resultados.push(resultado);
    }

    return resultados;
}


export const formatearSalida_proyectosAprobados = (tipo, cantidad, condicion) => {

    const labels = cantidad.map(item => item.nombre);
    const data = cantidad.map(item => item.aprobados);
    const backgroundColor = cantidad.map(item => item.color);

    let datasets = {}
    if(tipo == "departamento"){
        datasets = {
            label: `Cantidad de Proyectos ${condicion} por ${tipo}`,
            data,
        };
    } else {
        datasets = {
            label: `Cantidad de Proyectos ${condicion} por ${tipo}`,
            data,
            backgroundColor
        };
    }
    return { labels, datasets };
}