import { Schema, model } from "mongoose";

const CategoriaSchema = new Schema({
    nombre:{
        type: String,
        required: true,
    },
    abreviatura:{
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    activa: {
        type: Boolean,
        required: true,
        default: true,
    }
})

export const Categoria = model('Categoria', CategoriaSchema);



// DOCUMENTACION SWAGGER

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre de la categoría.
 *         abreviatura:
 *           type: string
 *           description: La abreviatura de la categoría.
 *         color:
 *           type: string
 *           description: El color representativo de la categoría.
 *       required:
 *         - nombre
 *         - abreviatura
 *         - color
 */