import { integrations } from 'googleapis/build/src/apis/integrations';
import { Schema, model } from 'mongoose';

const evaluacionSchema = new Schema({
  rubricaId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Rubrica', // Referencia al modelo de Rubrica si es necesario
  },
  criterioId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Criterio', // Referencia al modelo de Criterio si es necesario
  },
  opcionSeleccionada: {
    type: String,
    required: true,
  },
  evaluadoresId: {
    type: [Schema.Types.ObjectId],
    required: true,
    ref: 'Evaluador', // Referencia al modelo de Usuario (evaluador)
  },
  puntaje: {
    type: Number,
    required: false,
  },
  proyectoId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Proyecto', // Referencia al modelo de Proyecto si es necesario
  },
});

export const Evaluacion = model('Evaluacion', evaluacionSchema);