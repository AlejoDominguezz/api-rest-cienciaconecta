import { Schema, model } from "mongoose";

// REVISAR si no faltan campos o si son correctos los mismos
//validar tema de ROL

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
    require: [true, "El nombre es obligatorio"],
  },
  apellido: {
    type: String,
    require: [true, "El apellido es obligatorio"],
  },
  estado: {
    type: Boolean,
    default: true,
    required: true,
  },
  cuil: {
    type: String,
    require: [true, "El CUIL es obligatorio"],
  },
  correo: {
    type: String,
    require: [true, "El correo es obligatorio"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "La contraseña es obligatoria"],
  },
  dni: {
    type: Number,
    require: [true, "El número de DNI es obligatorio"],
  },
  dni: {
    type: Number,
    require: [true, "El número de DNI es obligatorio"],
  },

});

export const Usuario = model('Usuario', UsuarioSchema);
