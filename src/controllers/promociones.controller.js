import { Evaluacion, estadoEvaluacion, nombreEstadoEvaluacion } from "../models/Evaluacion.js";
import { EvaluacionExposicion, estadoEvaluacionExposicion, nombreEstadoExposicion } from "../models/EvaluacionExposicion.js";
import { Nivel } from "../models/Nivel.js"
import { Promocion, promocionA } from "../models/Promocion.js"
import { Proyecto, nombreEstado } from "../models/Proyecto.js";
import { getFeriaActivaFuncion } from "./ferias.controller.js"


// Función para obtener todos los proyectos que están en condiciones de ser promovidos a instancia regional --------------------------------------
export const obtenerProyectosProvincial = async (req, res) => {
    const id_nivel = req.body.nivel;
    const id_sede = req.body.sede;

    const proyectos = await Proyecto.find({nivel: id_nivel, sede: id_sede})
    .select('-__v -QR -id_carpeta_drive')
            .lean()
            .exec();

    if(proyectos.length == 0){
        return res.status(204).json({ error: "No existen proyectos que cumplan las condiciones para ser promovidos" });
    }
    
    const proyectosInfoEvaluacion = await agregarInformacionEvaluacion(proyectos)

    const proyectosFiltrados = proyectosInfoEvaluacion.filter((proyecto) => 
        (proyecto.exposicion?.estado == estadoEvaluacionExposicion.cerrada) &&
        (proyecto.evaluacion?.estado == estadoEvaluacion.cerrada))

    const proyectosSorted = proyectosFiltrados.sort((a, b) => b.exposicion.puntajeFinal - a.exposicion.puntajeFinal);
    
    return res.json({proyectos: proyectosSorted});
}


// Función para agregar información sobre la Evaluación Teórica y de Exposición a un proyecto -----------------------------------------------------
const agregarInformacionEvaluacion = async (proyectos) => {
    const proyectosInfoEvaluacion = await Promise.all(
        proyectos.map(async (proyecto) => {
            const evaluacion_teorica = await Evaluacion.findOne({proyectoId: proyecto._id})
            .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
            .lean()
            .exec();

            const evaluacion_exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
            .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
            .lean()
            .exec();

            if(!evaluacion_teorica ){

                return {
                  ...proyecto,
                  nombreEstado: nombreEstado[proyecto.estado],
                }
    
              } else if(!evaluacion_exposicion) {
    
                evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
                return {
                  ...proyecto,
                  nombreEstado: nombreEstado[proyecto.estado],
                  evaluacion: evaluacion_teorica,
                };
    
              } 
    
              evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
              evaluacion_exposicion.nombreEstado = nombreEstadoExposicion[evaluacion_exposicion.estado];
              return {
                ...proyecto,
                nombreEstado: nombreEstado[proyecto.estado],
                evaluacion: evaluacion_teorica,
                exposicion: evaluacion_exposicion,
              };

        })
    )

    return proyectosInfoEvaluacion
}



// Función para agregar información sobre la Evaluación Teórica y de Exposición a un proyecto -----------------------------------------------------
export const agregarInformacionEvaluacionProyecto = async (proyecto) => {
    
            const evaluacion_teorica = await Evaluacion.findOne({proyectoId: proyecto._id})
            .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
            .lean()
            .exec();

            const evaluacion_exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
            .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
            .lean()
            .exec();

            if(!evaluacion_teorica ){

                return {
                  ...proyecto,
                  nombreEstado: nombreEstado[proyecto.estado],
                }
    
              } else if(!evaluacion_exposicion) {
    
                evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
                return {
                  ...proyecto,
                  nombreEstado: nombreEstado[proyecto.estado],
                  evaluacion: evaluacion_teorica,
                };
    
              } 
    
              evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
              evaluacion_exposicion.nombreEstado = nombreEstadoExposicion[evaluacion_exposicion.estado];
              return {
                ...proyecto,
                nombreEstado: nombreEstado[proyecto.estado],
                evaluacion: evaluacion_teorica,
                exposicion: evaluacion_exposicion,
              };

}


// Funcion para promover proyectos a la instancia Provincial ---------------------------------------------------------------------------------------------------
export const promoverProyectos_Provincial = async (req, res) => {
    try {
        const id_proyectos = req.body.proyectos
        const id_nivel = req.body.nivel;
        const id_sede = req.body.sede;
        const feriaActiva = await getFeriaActivaFuncion()
        const cuposNivelSede = feriaActiva.instancias.instanciaRegional.cupos.find(cupo => (cupo.nivel?.toString() === id_nivel.toString()) && (cupo.sede?.toString() === id_sede.toString()));
        const cantidadCupos = cuposNivelSede ? cuposNivelSede.cantidad : 0;

        if(id_proyectos.length > cantidadCupos) {
            return res.status(401).json({ error: `No es posible promover ${id_proyectos.length} proyectos. El límite de cupos en esta instancia para el nivel ingresado es ${cantidadCupos}` });
        }

        let promocion = await Promocion.findOne({nivel: id_nivel, sede: id_sede, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial})
        
        if(promocion) {
            promocion.proyectos = id_proyectos
        } else {
            promocion = new Promocion({
                proyectos: id_proyectos,
                feria: feriaActiva._id,
                promocionAInstancia: promocionA.instanciaProvincial,
                nivel: id_nivel,
                sede: id_sede,
            })
        }

        promocion.save()
        return res.json({msg: "Todos los proyectos han sido agregado a la lista de proyectos por promover al final de la instancia"});

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error de servidor" });
    }
}