import { Schema, model } from "mongoose";

const SedeSchema = new Schema({
    nombre:{
        type: String,
        required: true,
    },
    cue:{
        type: Number,
        required: true,
    }
})


export const Sede = model('Sede', SedeSchema);