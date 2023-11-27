// Funcion para obtener devoluciones de evaluación ---------------------------------------------------------------------------------------------------

import { Evaluacion } from "../models/Evaluacion.js";
import { EvaluacionExposicion } from "../models/EvaluacionExposicion.js";
import { EvaluacionExposicionProvincial } from "../models/EvaluacionExposicion_Provincial.js";
import { estadoFeria } from "../models/Feria.js";
import { getFeriaActivaFuncion } from "./ferias.controller.js";

export const obtenerDevoluciones = async (req, res) => {

    try {
  
      const proyecto = req.proyecto;
  
      const feriaActiva = await getFeriaActivaFuncion()
      if(!feriaActiva) {
        return res.status(404).json({error: "No existe una Feria activa en este momento"})
      }
  
      let devoluciones = {};
  
      // Hasta antes de que exista una evaluación, se devuelve un objeto vacío
      if(parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_EnEvaluacion)) {
        devoluciones = {};
  
      // A partir de que se finalizó la evaluacion regional, se muetra la evaluación
      } else if (parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_EnExposicion) ) {
        
        const evaluacion = await Evaluacion.findOne({proyectoId: proyecto._id})
        const comentarios_evaluacion = obtenerNombreRubrica(feriaActiva, evaluacion)
  
        devoluciones = {
          evaluacion: comentarios_evaluacion,
        }
        
      // A partir de que se finalizó la exposición regional, se muetra la evaluación y exposición regional
      } else if (parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaProvincial_EnExposicion))  {
  
        const evaluacion = await Evaluacion.findOne({proyectoId: proyecto._id})
        const comentarios_evaluacion = obtenerNombreRubrica(feriaActiva, evaluacion)
  
        const exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
        const comentarios_exposicion = obtenerNombreRubrica(feriaActiva, exposicion)
        
  
        devoluciones = {
          evaluacion: comentarios_evaluacion,
          exposicion: comentarios_exposicion,
        }
  
      // A partir de la finalización de la exposición provincial, 
      // se muetra la evaluación y exposición regional, y la exposición provincial
      } else if (parseInt(feriaActiva.estado) <= parseInt(estadoFeria.finalizada)) {
        
        const evaluacion = await Evaluacion.findOne({proyectoId: proyecto._id})
        const comentarios_evaluacion = obtenerNombreRubrica(feriaActiva, evaluacion)
  
        const exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
        const comentarios_exposicion = obtenerNombreRubrica(feriaActiva, exposicion)
  
        const exposicion_provincial = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto._id})
        const comentarios_exposicion_provincial = obtenerNombreRubrica(feriaActiva, exposicion_provincial)
  
        devoluciones = {
          evaluacion: comentarios_evaluacion,
          exposicion: comentarios_exposicion,
          exposicion_provincial: comentarios_exposicion_provincial
        }
  
      }
  
      return res.json({devoluciones, titulo: proyecto.titulo})
  
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Error de servidor" });
    }
  
  }
  
  const obtenerNombreRubrica = (feriaActiva, evaluacion) => {
    const comentarios_evaluacion = evaluacion?.comentarios.map((comentario) => {
      const rubrica = feriaActiva.criteriosEvaluacion.find((rubrica) => rubrica._id.equals(comentario.rubricaId));
      return {
        rubrica: rubrica ? rubrica.nombreRubrica : null,
        comentario: comentario.comentario,
      };
    });
  
    return comentarios_evaluacion;
  }