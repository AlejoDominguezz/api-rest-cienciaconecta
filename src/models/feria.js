import {Schema , model} from 'mongoose';
import {Sede} from './Sede.js'

const feriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true , 'El nombre es obligatorio'],
    },
    descripcion: {
        type: String,
        required: [true , 'La descripción es obligatoria'],
    },
    logo: {
        type: String,
        required: false,
    },
    fechaInicioFeria: {
        type: Date,
        required: [true , 'La fecha de inicio de Feria es obligatoria'],
        default: Date.now(),
    },
    fechaFinFeria: {
        type: Date,
        required: [true , 'La fecha de fin de Feria es obligatoria'],
    },

    instancias: {
        instanciaEscolar: {
            fechaInicioInstancia: {
                type: Date,
                required: [true , 'La fecha de inicio de instancia escolar es obligatoria'],
            },
            fechaFinInstancia: {
                type: Date,
                required: [true , 'La fecha de fin de instancia escolar es obligatoria'],
            },
            estado: {
                type: String,
                default: "0",
                enum:['0', '1', '2', '3', '4', '5', '6'],
                required: [true , 'El estado de instancia escolar es obligatorio'],
            }
        },
        instanciaRegional: {
            fechaInicioEvaluacionTeorica: {
                type: Date,
                required: [true , 'La fecha de inicio de evaluación teórica de instancia regional es obligatoria'],
            },
            fechaFinEvaluacionTeorica: {
                type: Date,
                required: [true , 'La fecha de fin de evaluación teórica de instancia regional es obligatoria'],
            },
            fechaInicioEvaluacionPresencial: {
                type: Date,
                required: [true , 'La fecha de inicio de evaluación presencial de instancia regional es obligatoria'],
            },
            fechaFinEvaluacionPresencial: {
                type: Date,
                required: [true , 'La fecha de fin de evaluación presencial de instancia regional es obligatoria'],
            },
            estado: {
                type: String,
                default: "0",
                enum:['0', '1', '2', '3', '4', '5', '6'],
                required: [true , 'El estado de instancia regional es obligatorio'],
            },
            cupos: [{
                sede: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'EstablecimientoEducativo',
                },
                nivel: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Nivel',
                },
                cantidad: {
                    type: Number,
                    required: true,
                }
            }],
            sedes: {
                type: [Schema.Types.ObjectId],
                required: [true , 'Se requiere al menos una sede para instancia regional'],
                ref: 'Sede',
            },
        },
        instanciaProvincial: {
            fechaInicioEvaluacionPresencial: {
                type: Date,
                required: [true , 'La fecha de inicio de evaluación presencial de instancia provincial es obligatoria'],
            },
            fechaFinEvaluacionPresencial: {
                type: Date,
                required: [true , 'La fecha de fin de evaluación presencial de instancia provincial es obligatoria'],
            },
            estado: {
                type: String,
                default: "0",
                enum:['0', '1', '2', '3', '4', '5', '6'],
                required: [true , 'El estado de instancia provincial es obligatorio'],
            },
            cupos: [{
                nivel: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Nivel',
                },
                cantidad: {
                    type: Number,
                    required: true,
                }
            }],
            sede: {
                type: Schema.Types.ObjectId,
                required: false,
                ref: 'EstablecimientoEducativo',
            },
        }

    },

    fechaInicioPostulacionEvaluadores: {
        type: Date,
        required: false,
    },
    fechaFinPostulacionEvaluadores: {
        type: Date,
        required: false,
    },

    fechaInicioAsignacionProyectos: {
        type: Date,
        required: false,
    },
    fechaFinAsignacionProyectos: {
        type: Date,
        required: false,
    },
    
    // criteriosEvaluacion: {
    //     type: [Schema.Types.ObjectId],
    //     required: false,
    //     ref: 'Rubrica',
    // },

    criteriosEvaluacion: [{
        nombreRubrica: {
            type: String,
            required: true,
        },
        criterios: [{
            nombre: {
                type: String,
                required: true,
            },
            opciones: [{
                type: String,
                required: true,
            }],
            ponderacion: {
                type: Number,
                required: true,
                min: 0,
                max: 1,
            },
        }],
    }],

    estado: {
        type: String,
        default: "1",
        enum:['0', '1', '2', '3', '4', '5', '6'],
        required: true
    },

    usuarioResponsable: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Usuario",
    }
})


export const Feria = model('Feria', feriaSchema);

export const estadoFeria = {
    //inactiva: '0',
    creada: '1',
    instanciaEscolar: '2',
    instanciaRegional: '3',
    instanciaProvincial: '4',
    instanciaNacional: '5',
    finalizada: '6',
  };

// Atributos de Feria --------------------------------------------

// Nombre y descripción de la feria * ----
// Logo de la feria ----
// Fecha de inicio y fin de Feria * ----
// Fecha de inicio y fin de inscripción de etapa escolar * ---
// Fecha de inicio y fin de inscripción de etapa regional * ---
// Fecha de inicio y fin de evaluación teórica regional * ----
// Fecha de inicio y fin de exposición presencial regional * ---
// Fecha de inicio y fin de exposición presencial provincial * ---
// Fecha de inicio y fin de postulación de evaluadores ---
// Fecha de inicio y fin de asignación de proyectos a evaluadores ---
// Sedes etapa regional elegidas para la feria * ---
// Sedes etapa provincial elegidas para la feria ---
// Cupos de proyectos para nivel inicial, primario, secundario y superior para instancia nacional * ---
// Criterios de evaluación generales ???
// Estado [0 = “inactiva“, 1 = “inicio”, 2 = “instancia escolar”, 3 = “instancia regional”, 4 = “evaluación regional”, 5 = “instancia provincial“,  6 = “evaluación provincial”, 7 = “finalización”] (Estados provisorios) * ---

// * Requerido