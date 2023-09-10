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




/**
 * @swagger
 * components:
 *   schemas:
 *     Feria:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: El nombre de la feria.
 *         descripcion:
 *           type: string
 *           description: La descripción de la feria.
 *         logo:
 *           type: string
 *           description: El logo de la feria (opcional).
 *         fechaInicioFeria:
 *           type: string
 *           format: date
 *           description: La fecha de inicio de la feria.
 *         fechaFinFeria:
 *           type: string
 *           format: date
 *           description: La fecha de fin de la feria.
 *         instancias:
 *           type: object
 *           properties:
 *             instanciaEscolar:
 *               type: object
 *               properties:
 *                 fechaInicioInstancia:
 *                   type: string
 *                   format: date
 *                   description: La fecha de inicio de la instancia escolar.
 *                 fechaFinInstancia:
 *                   type: string
 *                   format: date
 *                   description: La fecha de fin de la instancia escolar.
 *                 estado:
 *                   type: string
 *                   enum:
 *                     - '0'
 *                     - '1'
 *                     - '2'
 *                     - '3'
 *                     - '4'
 *                     - '5'
 *                     - '6'
 *                   description: El estado de la instancia escolar.
 *             instanciaRegional:
 *               type: object
 *               properties:
 *                 fechaInicioEvaluacionTeorica:
 *                   type: string
 *                   format: date
 *                   description: La fecha de inicio de la evaluación teórica de la instancia regional.
 *                 fechaFinEvaluacionTeorica:
 *                   type: string
 *                   format: date
 *                   description: La fecha de fin de la evaluación teórica de la instancia regional.
 *                 fechaInicioEvaluacionPresencial:
 *                   type: string
 *                   format: date
 *                   description: La fecha de inicio de la evaluación presencial de la instancia regional.
 *                 fechaFinEvaluacionPresencial:
 *                   type: string
 *                   format: date
 *                   description: La fecha de fin de la evaluación presencial de la instancia regional.
 *                 estado:
 *                   type: string
 *                   enum:
 *                     - '0'
 *                     - '1'
 *                     - '2'
 *                     - '3'
 *                     - '4'
 *                     - '5'
 *                     - '6'
 *                   description: El estado de la instancia regional.
 *                 cupos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sede:
 *                         type: string
 *                         description: ID de la sede asociada.
 *                       nivel:
 *                         type: string
 *                         description: ID del nivel asociado.
 *                       cantidad:
 *                         type: integer
 *                         description: La cantidad de cupos disponibles.
 *                 sedes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Lista de IDs de sedes asociadas a la instancia regional.
 *             instanciaProvincial:
 *               type: object
 *               properties:
 *                 fechaInicioEvaluacionPresencial:
 *                   type: string
 *                   format: date
 *                   description: La fecha de inicio de la evaluación presencial de la instancia provincial.
 *                 fechaFinEvaluacionPresencial:
 *                   type: string
 *                   format: date
 *                   description: La fecha de fin de la evaluación presencial de la instancia provincial.
 *                 estado:
 *                   type: string
 *                   enum:
 *                     - '0'
 *                     - '1'
 *                     - '2'
 *                     - '3'
 *                     - '4'
 *                     - '5'
 *                     - '6'
 *                   description: El estado de la instancia provincial.
 *                 cupos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nivel:
 *                         type: string
 *                         description: ID del nivel asociado.
 *                       cantidad:
 *                         type: integer
 *                         description: La cantidad de cupos disponibles.
 *                 sede:
 *                   type: string
 *                   description: ID del establecimiento educativo asociado (opcional).
 *         fechaInicioPostulacionEvaluadores:
 *           type: string
 *           format: date
 *           description: La fecha de inicio de la postulación de evaluadores (opcional).
 *         fechaFinPostulacionEvaluadores:
 *           type: string
 *           format: date
 *           description: La fecha de fin de la postulación de evaluadores (opcional).
 *         fechaInicioAsignacionProyectos:
 *           type: string
 *           format: date
 *           description: La fecha de inicio de la asignación de proyectos (opcional).
 *         fechaFinAsignacionProyectos:
 *           type: string
 *           format: date
 *           description: La fecha de fin de la asignación de proyectos (opcional).
 *         criteriosEvaluacion:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nombreRubrica:
 *                 type: string
 *                 description: El nombre de la rúbrica.
 *               criterios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       description: El nombre del criterio.
 *                     opciones:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: Lista de opciones para el criterio.
 *                     ponderacion:
 *                       type: number
 *                       description: La ponderación del criterio (entre 0 y 1).
 *         estado:
 *           type: string
 *           enum:
 *             - '0'
 *             - '1'
 *             - '2'
 *             - '3'
 *             - '4'
 *             - '5'
 *             - '6'
 *           description: El estado de la feria.
 *         usuarioResponsable:
 *           type: string
 *           description: ID del usuario responsable de la feria.
 *       required:
 *         - nombre
 *         - descripcion
 *         - fechaInicioFeria
 *         - fechaFinFeria
 *         - instancias
 *         - estado
 *         - usuarioResponsable
 */