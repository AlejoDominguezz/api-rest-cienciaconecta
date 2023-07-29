import { Schema, model } from "mongoose";

const NivelSchema = new Schema({
    nombre:{
        type: String,
        required: true,
    },
    abreviatura:{
        type: String,
        required: true,
    },
    codigo:{
        type: String,
        required: true,
    }
})


export const Nivel = model('Nivel', NivelSchema);