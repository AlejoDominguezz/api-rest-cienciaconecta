import { Schema, model } from "mongoose";

const ProyectoSchema = new Schema({

  // ------------------ INSTANCIA ESCOLAR --------------------------------
  titulo: {
    type: String,
    required: [true, "El título del proyecto es requerido"],
    trim: true,
    unique: true,
  },
  descripcion: {
    type: String,
    required: [true, "La reseña del proyecto es requerido"],
  },
  nivel: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Nivel",
  },
  categoria: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Categoria",
  },
  // nombreEscuela: {
  //   type: String,
  //   required: [true, "El nombre de la escuela es requerido"],
  // },
  // cueEscuela: {
  //   type: String,
  //   required: [true, "El CUE de la escuela es requerido"],
  // },
  // privada: {
  //   type: Boolean,
  //   required: [true, "Se debe indicar si la escuela es privada o pública"],
  // },
  establecimientoEducativo: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "EstablecimientoEducativo",
  },
  emailEscuela: {
    type: String,
    required: [true, "Se debe indicar un email de contacto de la escuela"],
  },
  idResponsable: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Docente",
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now,
  },
  feria: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Feria",
  },
  estado: {
    type: String,
    default: '0',
    enum:['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']},

  // ------------------ INSTANCIA REGIONAL --------------------------------
  videoPresentacion: {
    type: String,
    trim: true,
  },
  registroPedagogico: {
    type: String,
    
  },
  carpetaCampo: {
    type: String,
    
  },
  informeTrabajo: {
    type: String,
  
  },
  sede:{
    type: Schema.Types.ObjectId,
    ref: 'EstablecimientoEducativo'
  },
  autorizacionImagen: {
    // type: Boolean,
    type: String,
  },
  id_carpeta_drive: {
    type: String,
  },
  nameCarpetaCampo: {
    type: String,
  },
  nameRegistroPedagogicopdf: {
    type: String,
  },
  nameAutorizacionImagen: {
    type: String,
  },
  nameInformeTrabajo: {
    type: String,
  },
  grupoProyecto: [
    {
      nombre: {
        type: String,
      },
      apellido: {
        type: String,
      },
      dni: {
        type: String,
      },
    },
  ],
  evaluadoresRegionales: {
    type: [Schema.Types.ObjectId],
    required: false,
    ref: "Evaluador",
  },

  QR: {
    type: String,
  } 

});

export const estado = {
  instanciaEscolar: '0',
  instanciaRegional: '1',
  enEvaluacionRegional: '2',
  evaluadoRegional: '3',
  promovidoProvincial: '4',
  enEvaluacionProvincial: '5',
  evaluadoProvincial: '6',
  promovidoNacional: '7',
  finalizado: '8',
  inactivo: '9',

};

export const nombreEstado = {
  0: "Instancia escolar",
  1: "Instancia regional",
  2: "En evaluación regional",
  3: "Evaluado en instancia regional",
  4: "Promovido a instancia provincial",
  5: "En evaluación provincial",
  6: "Evaluado en instancia provincial",
  7: "Promovido a instancia nacional",
  8: "Finalizado",
  9: "Inactivo",
}

export const Proyecto = model("Proyecto", ProyectoSchema);




// DOCUMENTACION SWAGGER
/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           description: El título del proyecto.
 *         descripcion:
 *           type: string
 *           description: La descripción del proyecto.
 *         nivel:
 *           type: string
 *           description: ID del nivel del proyecto.
 *         categoria:
 *           type: string
 *           description: ID de la categoría del proyecto.
 *         establecimientoEducativo:
 *           type: string
 *           description: ID del establecimiento educativo asociado al proyecto.
 *         emailEscuela:
 *           type: string
 *           description: El correo electrónico de contacto de la escuela.
 *         idResponsable:
 *           type: string
 *           description: ID del docente responsable del proyecto.
 *         fechaInscripcion:
 *           type: string
 *           format: date
 *           description: La fecha de inscripción del proyecto.
 *         feria:
 *           type: string
 *           description: ID de la feria a la que pertenece el proyecto.
 *         estado:
 *           type: string
 *           enum:
 *             - '0'
 *             - '1'
 *             - '2'
 *             - '3'
 *             - '4'
 *             - '5'
 *             - '6'
 *           description: El estado del proyecto.
 *         videoPresentacion:
 *           type: string
 *           description: URL del video de presentación del proyecto.
 *         registroPedagogico:
 *           type: string
 *           description: URL del registro pedagógico del proyecto.
 *         carpetaCampo:
 *           type: string
 *           description: URL de la carpeta de campo del proyecto.
 *         informeTrabajo:
 *           type: string
 *           description: URL del informe de trabajo del proyecto.
 *         sede:
 *           type: string
 *           description: ID de la sede asociada al proyecto.
 *         autorizacionImagen:
 *           type: string
 *           description: Autorización para usar imágenes (opcional).
 *         id_carpeta_drive:
 *           type: string
 *           description: ID de la carpeta de Google Drive del proyecto.
 *         grupoProyecto:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre de un miembro del grupo.
 *               apellido:
 *                 type: string
 *                 description: El apellido de un miembro del grupo.
 *               dni:
 *                 type: string
 *                 description: El DNI de un miembro del grupo.
 *       required:
 *         - titulo
 *         - descripcion
 *         - nivel
 *         - categoria
 *         - establecimientoEducativo
 *         - emailEscuela
 *         - idResponsable
 *         - fechaInscripcion
 *         - feria
 *         - estado
 */

