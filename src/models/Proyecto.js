import { Schema, model } from "mongoose";

const ProyectoSchema = new Schema({
  titulo: {
    type: String,
    required: [true, "El título del proyecto es requerido"],
    trim: true,
    unique: true,
  },
  reseña: {
    type: String,
    required: [true, "La reseña del proyecto es requerido"],
  },
  nivel: {
    type: Number,
    required: [true, "El nivel del proyecto es requerido"],
    enum: [nivel.inicial, nivel.primario, nivel.secundario, nivel.terciario],
  },
  categoria: {
    type: Number,
    required: [true, "La categoría del proyecto es requerida"],
    enum: [categoria.computacion, categoria.naturales, categoria.robotica],
  },
  nombreEscuela: {
    type: String,
    required: [true, "El nombre de la escuela es requerido"],
  },
  cueEscuela: {
    type: Number,
    required: [true, "El CUE de la escuela es requerido"],
  },
  privada: {
    type: Boolean,
    required: [true, "Se debe indicar si la escuela es privada o pública"],
  },
  emailEscuela: {
    type: String,
    required: [true, "Se debe indicar un email de contacto de la escuela"],
  },
  idResponsable: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario'
  }
});

export const nivel = {
  inicial: 1,
  primario: 2,
  secundario: 3,
  terciario: 4,
};

export const categoria = {
  // Ejemplo
  computacion: 1,
  naturales: 2,
  robotica: 3,
  // Preguntar que categorias hay
};

export const Proyecto = model('Proyecto', ProyectoSchema);