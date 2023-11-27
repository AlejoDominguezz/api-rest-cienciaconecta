import { capitalizarPalabras } from "../../helpers/capitalizarPalabras.js";
import { Categoria } from "../../models/Categoria.js";
import { EstablecimientoEducativo } from "../../models/EstablecimientoEducativo.js";
import { Nivel } from "../../models/Nivel.js";
import { obtenerTodasClases } from "./reportes_services.js";


export const contarCantidadProyectos = async (tipo, proyectosPorClase) => {
        
        let resultados = [];
        
        const todasClases = await obtenerTodasClases(tipo);

        // Recorrer todas las clases
        for (const clase of todasClases) {
            let idClase = null;
            if(tipo != "departamento"){
                idClase = clase._id.toString();
            } else {
                idClase = clase;
            }

            // Obtener proyectos para la clases actual
            const proyectos = proyectosPorClase[idClase] || [];
            const cantidadProyectos = proyectos.length;

            // Añadir la información de color al resultado
            let resultado = {};
            if (tipo != "departamento"){
                resultado = {
                    nombre: clase.abreviatura,
                    cantidad: cantidadProyectos,
                    color: clase.color || 'Color Desconocido'
                };
            } else {
                resultado = {
                    nombre: capitalizarPalabras(clase),
                    cantidad: cantidadProyectos,
                };
            }
        
            resultados.push(resultado);
        }

        return resultados;
}




export const formatearSalida_cantidadProyectosInscriptos = (tipo, cantidad) => {

    const labels = cantidad.map(item => item.nombre);
    const data = cantidad.map(item => item.cantidad);
    const backgroundColor = cantidad.map(item => item.color);

    let datasets = {}
    if(tipo == "departamento"){
        datasets = {
            label: `Cantidad de Proyectos Inscriptos por ${tipo}`,
            data,
        };
    } else {
        datasets = {
            label: `Cantidad de Proyectos Inscriptos por ${tipo}`,
            data,
            backgroundColor
        };
    }
   

    return { labels, datasets };
}