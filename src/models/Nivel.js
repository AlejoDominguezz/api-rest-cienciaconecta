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
    },
    color:{
        type: String,
        required: true,
    }
})


export const Nivel = model('Nivel', NivelSchema);


// DOCUMENTACION SWAGGER

/**
 * @swagger
 * components:
 *   schemas:
 *     Nivel:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre del nivel.
 *         abreviatura:
 *           type: string
 *           description: La abreviatura del nivel.
 *         codigo:
 *           type: string
 *           description: El código del nivel.
 *       required:
 *         - nombre
 *         - abreviatura
 *         - codigo
 */