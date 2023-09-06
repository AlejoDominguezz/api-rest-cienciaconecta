import { Schema, model } from "mongoose";

const CategoriaSchema = new Schema({
    nombre:{
        type: String,
        required: true,
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
 *       required:
 *         - nombre
 */