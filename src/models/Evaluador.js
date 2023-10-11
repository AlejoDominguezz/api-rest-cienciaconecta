import { Schema, model } from "mongoose";

const EvaluadorSchema = new Schema({
  docente: {
    type: Boolean,
    required: [true, "Se debe indicar si es docente o investigador"], // True=Docente, False=Investigador
  },
  niveles: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: 'Nivel'
  },
  categorias: {
    type:  [Schema.Types.ObjectId],
    required: [true, "Se debe indicar al menos una categoría"],
    ref: 'Categoria'
  },
  sede: {
    type:  Schema.Types.ObjectId,
    required: [true, "Se debe indicar la sede en la cual se quiere evaluar"],
    ref: 'EstablecimientoEducativo'
  },
  CV: {
    type: String,
    required: false
  },
  id_carpeta_cv: {
    type: String,
    required: false
  },
  antecedentes: [{
    year: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      required: true,
      enum:['1', '2', '3'] // 1=Referente, 2=Evaluador, 3=Responsable
    },
  }],
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
  fechaPostulacion:{
    type: Date,
    required: [true, "Se debe indicar la fecha de postulacion"],
    default: Date.now()
  },
  pendiente:{
    type: Boolean
  }
});


export const Evaluador = model('Evaluador', EvaluadorSchema);



// DOCUMENTACION SWAGGER
/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluador:
 *       type: object
 *       properties:
 *         docente:
 *           type: boolean
 *           description: Indica si es docente o investigador (True=Docente, False=Investigador).
 *         niveles:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de niveles a los que está asociado el evaluador.
 *         categorias:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de categorías a las que está asociado el evaluador.
 *         sede:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de sedes en las cuales se quiere evaluar el evaluador.
 *         CV:
 *           type: string
 *           description: Enlace al currículum vitae del evaluador.
 *         antecedentes:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de años de las ferias en las que participó anteriormente.
 *         feria:
 *           type: string
 *           description: ID de la feria para la cual se ha postulado el evaluador.
 *         pendiente:
 *           type: boolean
 *           description: Indica si la evaluación está pendiente.
 */