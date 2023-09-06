import { Schema, model } from "mongoose";

const EstablecimientoEducativoSchema = new Schema({
    nombre:{
        type: String,
        required:  [true, "El nombre del establecimiento educativo es requerido"],
    },
    cue: {
        type: String,
        required: [true, "El CUE del establecimiento educativo es requerido"],
    },
    provincia: {
        type: String,
        required: [true, "La provincia del establecimiento educativo es requerido"],
    },
    departamento: {
        type: String,
        required: [true, "El departamento del establecimiento educativo es requerido"],
    },
    localidad: {
        type: String,
        required: [true, "La localidad del establecimiento educativo es requerido"],
    },
    domicilio: {
        type: String,
        required: [true, "El domicilio del establecimiento educativo es requerido"],
    },
    CP: {
        type: String,
        required: false,
    },
    telefono: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    niveles:{
        inicial:{
            type: Boolean,
            required:true,
        },
        primario:{
            type: Boolean,
            required:true,
        },
        secundario:{
            type: Boolean,
            required:true,
        },
        terciario:{
            type: Boolean,
            required:true,
        }
    },
    ferias: {
        type: [Schema.Types.ObjectId],
        default: [],
        ref: 'Feria',
    }
})


export const EstablecimientoEducativo = model('EstablecimientoEducativo', EstablecimientoEducativoSchema);



// DOCUMENTACION SWAGGER
/**
 * @swagger
 * components:
 *   schemas:
 *     EstablecimientoEducativo:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre del establecimiento educativo.
 *         cue:
 *           type: string
 *           description: El CUE (Código Único de Establecimiento) del establecimiento educativo.
 *         provincia:
 *           type: string
 *           description: La provincia donde se encuentra el establecimiento educativo.
 *         departamento:
 *           type: string
 *           description: El departamento donde se encuentra el establecimiento educativo.
 *         localidad:
 *           type: string
 *           description: La localidad donde se encuentra el establecimiento educativo.
 *         domicilio:
 *           type: string
 *           description: El domicilio del establecimiento educativo.
 *         CP:
 *           type: string
 *           description: El código postal (CP) del establecimiento educativo (opcional).
 *         telefono:
 *           type: string
 *           description: El número de teléfono del establecimiento educativo (opcional).
 *         email:
 *           type: string
 *           description: La dirección de correo electrónico del establecimiento educativo (opcional).
 *         niveles:
 *           type: object
 *           properties:
 *             inicial:
 *               type: boolean
 *               description: Indica si el establecimiento ofrece nivel inicial.
 *             primario:
 *               type: boolean
 *               description: Indica si el establecimiento ofrece nivel primario.
 *             secundario:
 *               type: boolean
 *               description: Indica si el establecimiento ofrece nivel secundario.
 *             terciario:
 *               type: boolean
 *               description: Indica si el establecimiento ofrece nivel terciario.
 *           description: Información sobre los niveles educativos ofrecidos por el establecimiento.
 *         ferias:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de ferias asociadas al establecimiento (opcional).
 *       required:
 *         - nombre
 *         - cue
 *         - provincia
 *         - departamento
 *         - localidad
 *         - domicilio
 *         - niveles
 */