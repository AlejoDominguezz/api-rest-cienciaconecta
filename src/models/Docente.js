import { Schema, model } from "mongoose";

const DocenteSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  apellido: {
    type: String,
    required: [true, "El apellido es obligatorio"],
  },
  cuil: {
    type: String,
    required: [true, "El CUIL es obligatorio"],
  },
  // dni: {
  //   type: String,
  //   required: [true, "El número de DNI es obligatorio"],
  // },
  // cue: {
  //   type: String,
  //   required: [true, "El CUE es obligatorio"],
  // },
  telefono: {
    type: String,
    required: [true, "El número de teléfono es obligatorio"],
  },
  cargo: {
    type: String,
    required: [true, "El cargo del docente en la institución es obligatorio"],
  },
  usuario: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  }
});


export const Docente = model('Docente', DocenteSchema);



// DOCUMENTACION SWAGGER
/**
 * @swagger
 * components:
 *   schemas:
 *     Docente:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre del docente.
 *         apellido:
 *           type: string
 *           description: El apellido del docente.
 *         cuil:
 *           type: string
 *           description: El CUIL del docente.
 *         telefono:
 *           type: string
 *           description: El número de teléfono del docente.
 *         cargo:
 *           type: string
 *           description: El cargo del docente en la institución.
 *         usuario:
 *           type: string
 *           description: El ID del usuario asociado al docente.
 *       required:
 *         - nombre
 *         - apellido
 *         - cuil
 *         - telefono
 *         - cargo
 *         - usuario
 */