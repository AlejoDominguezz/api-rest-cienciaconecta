import { Schema, model } from "mongoose";
import { roles } from "../helpers/roles.js";
import bcryptjs from 'bcryptjs';

// REVISAR si no faltan campos o si son correctos los mismos
//validar tema de ROL

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  apellido: {
    type: String,
    required: [true, "El apellido es obligatorio"],
  },
  estado: {
    type: Boolean, // activo, inactivo, pendiente
    default: true,
    required: true,
  },
  cuil: {
    type: String,
    required: [true, "El CUIL es obligatorio"],
  },
  email: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    trim: true,
    lowercase: true, 
    index: {unique: true}
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  dni: {
    type: Number,
    required: [true, "El número de DNI es obligatorio"],
  },
  cue: {
    type: Number,
    required: [true, "El CUE es obligatorio"],
  },
  rol: {
    type: Number,
    default: roles.responsableProyecto,
  },
});


UsuarioSchema.pre("save", async function(next){
  const user = this;

  if(!user.isModified('password')) return next()

  try {
      const salt = await bcryptjs.genSalt(10)
      user.password = await bcryptjs.hash(user.password, salt)
      next()
  } catch (error) {
      console.log(error)
      throw new Error('Falló el hash de contraseña')
  }
})


UsuarioSchema.methods.comparePassword = async function(candidatePassword){
  return await bcryptjs.compare(candidatePassword, this.password)
}


export const Usuario = model('Usuario', UsuarioSchema);
