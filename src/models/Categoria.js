import { Schema, model } from "mongoose";

const CategoriaSchema = new Schema({
    nombre:{
        type: String,
        required: true,
    }
})


export const Categoria = model('Categoria', CategoriaSchema);