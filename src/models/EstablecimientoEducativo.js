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