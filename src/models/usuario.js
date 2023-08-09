import { Schema, model } from "mongoose";
import { roles } from "../helpers/roles.js";
import bcryptjs from 'bcryptjs';

// REVISAR si no faltan campos o si son correctos los mismos
//validar tema de ROL

const UsuarioSchema = new Schema({
  cuil: {
    type: String,
    required: [true, "El CUIL es obligatorio"],
    unique: true,
    index: { unique: true },
  },
  email: {
    type: String,
    required: [true, "El correo es obligatorio"],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  estado: {
    type: String, // 0=inactivo, 1=activo, 2=pendiente
    default: '2',
    required: true,
    enum:['0','1','2']
  },
  roles: {
    type: [String],
    default: [roles.docente],
  },
  tokenConfirm: {
    type: String,
    default: null,
  },
  cuentaConfirmada: {
    type: Boolean,
    default: false,
  },
  tokenRecuperacion: {
    type: String,
    default: null,
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
