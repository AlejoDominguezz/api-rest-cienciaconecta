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
  }]
});

export const Evaluacion = model('Evaluacion', evaluacionSchema);