import { Schema, model } from "mongoose";

const ReferenteSchema = new Schema({
  sede: {
    type:  Schema.Types.ObjectId,
    required: [true, "Se debe indicar la sede en la cual se quiere evaluar"],
    ref: 'EstablecimientoEducativo'
  },
  feria:{
    type:  Schema.Types.ObjectId,
    required: [true, "Se debe indicar la feria para la cual se ha postulado"],
    ref: 'Feria'
  },
  idDocente:{
    type:  Schema.Types.ObjectId,
    required: [true, "Se debe indicar el docente que se ha postulado"],
    ref: 'Docente'
  },
  // evaluadoresAsignados:{
  //   type: [Schema.Types.ObjectId],
  //   required: false,
  //   ref: 'Evaluador'
  // }
});


export const Referente = model('Referente', ReferenteSchema);


// DOCUMENTACION SWAGGER
/**
 * @swagger
 * components:
 *   schemas:
 *     Referente:
 *       type: object
 *       properties:
 *         sede:
 *           type: string
 *           description: ID de la sede en la cual se quiere evaluar el evaluador.
 *         feria:
 *           type: string
 *           description: ID de la feria para la cual se ha postulado el evaluador.
 *         idDocente:
 *           type: string
 *           description: ID del docente que se ha postulado.
 *         evaluadoresAsignados:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de evaluadores asignados (opcional).
 */
