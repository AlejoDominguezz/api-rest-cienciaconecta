const { Schema, model } = require("mongoose");

//definir el Schema de usuario, con todos los campos necesarios
// REVISAR si no faltan campos o si son correctos los mismos
//validar tema de ROL

const UsuarioSchema = Schema({
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

});

module.exports = model("Usuario", UsuarioSchema);
