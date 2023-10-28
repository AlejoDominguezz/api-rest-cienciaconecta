import { getFeriaActivaFuncion } from "../controllers/ferias.controller.js";
import { estadoFeria, siguienteFecha } from "../models/Feria.js";

export const infoFeria = async() => {
    const feriaActiva = await getFeriaActivaFuncion()
    if(!feriaActiva){
        return null;
    }

    let nombre_estado = null;
    for (const key in estadoFeria) {
        if (estadoFeria[key] === feriaActiva.estado) {
            nombre_estado = key;
            break;
        }
    }

    const siguiente = siguienteFecha[nombre_estado]
    
    const keys = Object.keys(siguienteFecha);
    const index = keys.indexOf(nombre_estado);

    let fecha_inicio = null;
    if (index > 0) {
        const anterior = keys[index - 1];
        fecha_inicio = eval(`feriaActiva.${siguienteFecha[anterior]}`);
    } else {
        fecha_inicio = null;
    }


    const feria = {
      estado: feriaActiva.estado,
      nombre_estado: nombre_estado,
      fecha_inicio: fecha_inicio,
      siguiente_fecha: eval(`feriaActiva.${siguiente}`),
      fechas_evaluador: {
        fechaInicioPostulacionEvaluadores: feriaActiva.fechaInicioPostulacionEvaluadores,
        fechaFinPostulacionEvaluadores: feriaActiva.fechaFinPostulacionEvaluadores,
        fechaInicioAsignacionProyectos: feriaActiva.fechaInicioAsignacionProyectos,
        fechaFinAsignacionProyectos: feriaActiva.fechaFinAsignacionProyectos,
      }
    }

    return feria;
}