import { Schema, model } from "mongoose";

const ProyectoSchema = new Schema({

  // ------------------ INSTANCIA ESCOLAR --------------------------------
  titulo: {
    type: String,
    required: [true, "El título del proyecto es requerido"],
    trim: true,
    unique: true,
  },
  descripcion: {
    type: String,
    required: [true, "La reseña del proyecto es requerido"],
  },
  nivel: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Nivel",
  },
  categoria: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Categoria",
  },
  nombreEscuela: {
    type: String,
    required: [true, "El nombre de la escuela es requerido"],
  },
  cueEscuela: {
    type: String,
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
    ref: "Docente",
  },
  fechaInscripcion: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    default: '0',
    enum:['0', '1', '2', '3', '4', '5', '6']},

  // ------------------ INSTANCIA REGIONAL --------------------------------
  videoPresentacion: {
    type: String,
    trim: true,
  },
  registroPedagogico: {
    type: String,
    
  },
  carpetaCampo: {
    type: String,
    
  },
  informeTrabajo: {
    type: String,
  
  },
  sede:{
    type: Schema.Types.ObjectId,
    ref: 'Sede'
  },
  autorizacionImagen: {
    // type: Boolean,
    type: String,
  },
  id_carpeta_drive: {
    type: String,
  },
  grupoProyecto: [
    {
      nombre: {
        type: String,
      },
      apellido: {
        type: String,
      },
      dni: {
        type: Number,
      },
    },
  ],
});

export const estado = {
  instanciaEscolar: '0',
  instanciaRegional: '1',
  enEvaluacionRegional: '2',
  evaluadoRegional: '3',
  promovidoNacional: '4',
  finalizado: '5',
  inactivo: '6',
};

export const nombreEstado = [
  "Instancia escolar",
  "Instancia regional",
  "En evaluación regional",
  "Promovido a instancia nacional",
  "Finalizado",
  "Inactivo",
]

export const Proyecto = model("Proyecto", ProyectoSchema);
