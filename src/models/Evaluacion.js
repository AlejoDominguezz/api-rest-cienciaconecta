import { Schema, model } from 'mongoose';

const evaluacionSchema = new Schema({
  evaluacion: [{
    rubricaId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Rubrica',
    },
    criterioId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Criterio', 
    },
    opcionSeleccionada: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Opcion', 
    },
  }],
  comentarios: [{
    rubricaId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Rubrica',
    },
    comentario: {
      type: String,

    }
  }],
  evaluadorId: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Evaluador',
  }],
  puntaje: {
    type: Number,
    required: true,
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Proyecto', 
  },
  listo: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Evaluador',
  }],
  estado: {
    type: String,
    required: true,
    default: "1",
    enum:['1', '2', '3'], 
  },
  tokenSesion: {
    type:String,
    required:false,
    default: null,
  },
  ultimaEvaluacion: {
    type:Schema.Types.ObjectId,
    required: false,
    ref: 'Evaluador',
  },
  evaluando: {
    type:Schema.Types.ObjectId,
    required: false,
    ref: 'Evaluador',
  }
});

export const Evaluacion = model('Evaluacion', evaluacionSchema);

export const estadoEvaluacion = {
  enEvaluacion: "1", // Cuando alguien se encuentra evaluando ese proyecto
  abierta: "2", // Cuando nadie está evaluando el proyecto, pero se aún es posible evaluar
  cerrada: "3" // Cuando todos han dado "Listo" o el período de evaluación ha finalizado
}