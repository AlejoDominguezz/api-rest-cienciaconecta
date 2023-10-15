import { Schema, model } from 'mongoose';

const evaluacionExposicionSchema = new Schema({
  evaluacion: [{
    rubricaId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Rubrica',
    },
    criterioId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Criterio', 
    },
    opcionSeleccionada: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Opcion', 
    },
  }],
  comentarios: [{
    rubricaId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Rubrica',
    },
    comentario: {
      type: String,

    }
  }],
  evaluadorId: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Evaluador',
  }],
  puntajeExposicion: {
    type: Number,
    required: false,
  },
  puntajeFinal: {
    type: Number,
    required: false,
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Proyecto', 
  },
  listo: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Evaluador',
  }],
  estado: {
    type: String,
    required: true,
    default: "1",
    enum:['1', '2', '3'], 
  },
  tokenSesion: {
    type:String,
    required:false,
    default: null,
  },
  ultimaEvaluacion: {
    type:Schema.Types.ObjectId,
    required: false,
    ref: 'Evaluador',
  },
  evaluando: {
    type:Schema.Types.ObjectId,
    required: false,
    ref: 'Evaluador',
  }
});

export const EvaluacionExposicion = model('EvaluacionExposicion', evaluacionExposicionSchema);

export const estadoEvaluacionExposicion = {
  enEvaluacion: "1", // Cuando alguien se encuentra evaluando ese proyecto
  abierta: "2", // Cuando nadie está evaluando el proyecto, pero se aún es posible evaluar
  cerrada: "3" // Cuando todos han dado "Listo" o el período de evaluación ha finalizado
}


export const nombreEstadoExposicion = {
  1: "En evaluación",
  2: "Abierta",
  3: "Cerrada"
}


// DOCUMENTACION SWAGGER -------------------------------------------------------------------------------------------------

/**
 * @swagger
 * components:
 *   schemas:
 *     EvaluacionExposicion:
 *       type: object
 *       properties:
 *         evaluacion:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rubricaId:
 *                 type: string
 *                 description: ID de la rubrica asociada a la evaluación.
 *               criterioId:
 *                 type: string
 *                 description: ID del criterio asociado a la evaluación.
 *               opcionSeleccionada:
 *                 type: string
 *                 description: ID de la opción seleccionada en la evaluación.
 *           description: Lista de evaluaciones asociadas al proyecto.
 *         comentarios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rubricaId:
 *                 type: string
 *                 description: ID de la rubrica asociada al comentario.
 *               comentario:
 *                 type: string
 *                 description: Comentario asociado a la rubrica.
 *           description: Lista de comentarios asociados al proyecto.
 *         evaluadorId:
 *           type: array
 *           items:
 *             type: string
 *             description: ID del evaluador asociado a la evaluación.
 *           description: Lista de evaluadores asociados al proyecto.
 *         puntajeExposicion:
 *           type: number
 *           description: Puntaje de exposición asignado al proyecto.
 *         puntajeFinal:
 *           type: number
 *           description: Puntaje final asignado al proyecto.
 *         proyectoId:
 *           type: string
 *           description: ID del proyecto asociado a la evaluación.
 *         listo:
 *           type: array
 *           items:
 *             type: string
 *             description: ID de los evaluadores que han dado "Listo".
 *           description: Lista de evaluadores que han dado "Listo".
 *         estado:
 *           type: string
 *           description: Estado de la evaluación (1=enEvaluacion, 2=abierta, 3=cerrada).
 *         tokenSesion:
 *           type: string
 *           description: Token de sesión asociado a la evaluación.
 *         ultimaEvaluacion:
 *           type: string
 *           description: ID del evaluador que haya realizado la última evaluación.
 *         evaluando:
 *           type: string
 *           description: ID del evaluador que está realizando la evaluación.
 *       required:
 *         - evaluacion
 *         - evaluadorId
 *         - puntajeExposicion
 *         - puntajeFinal
 *         - proyectoId
 *         - estado
 */
