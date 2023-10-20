import {Schema , model} from 'mongoose';

const feriaSchema = new Schema({
    nombre: {
        type: String,
        required: [true , 'El nombre es obligatorio'],
    },
    descripcion: {
        type: String,
        required: [true , 'La descripción es obligatoria'],
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
            fechaPromocionAProvincial: {
                type: Date,
                required: [true , 'La fecha de promoción de proyectos a instancia provincial es obligatoria'],
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
                ref: 'EstablecimientoEducativo',
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
            fechaPromocionANacional: {
                type: Date,
                required: [true , 'La fecha de promoción de proyectos a instancia nacional es obligatoria'],
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
            // sede: {
            //     type: Schema.Types.ObjectId,
            //     required: false,
            //     ref: 'EstablecimientoEducativo',
            // },
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
                nombre: {
                    type: String,
                    required: true,
                },
                puntaje: {
                    type: Number,
                    required: true, // Puntaje de 0 a 100
                }
                
            }],
            ponderacion: {
                type: Number,
                required: true,
                min: 0,
                max: 100,
            },
        }],
        ponderacion: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        exposicion: {
            type: Boolean,      // True = Rubrica sólo para exposicion
            required: true,     // False = Rubrica sólo para evaluación teórica
        }
    }],

    estado: {
        type: String,
        default: "1",
        enum:['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
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
    creada: '0',
    iniciada: '1',
    instanciaEscolar: '2',
    instanciaEscolar_Finalizada: '3',
    instanciaRegional_EnEvaluacion: '4',
    instanciaRegional_EvaluacionFinalizada: '5',
    instanciaRegional_EnExposicion: '6',
    instanciaRegional_ExposicionFinalizada: '7',
    proyectosPromovidosA_instanciaProvincial: '8',
    instanciaProvincial_EnExposicion: '9',
    instanciaProvincial_ExposicionFinalizada: '10',
    proyectosPromovidosA_instanciaNacional: '11',
    finalizada: '12',
};


export const fechasFeria = {
    fechaInicio: "fechaInicioFeria",
    fechaFin: "fechaFinFeria",
    fechaInicioEscolar: "instancias.instanciaEscolar.fechaInicioInstancia",
    fechaFinEscolar: "instancias.instanciaEscolar.fechaFinInstancia",
    fechaInicioEvaluacionRegional: "instancias.instanciaRegional.fechaInicioEvaluacionTeorica",
    fechaFinEvaluacionRegional: "instancias.instanciaRegional.fechaFinEvaluacionTeorica",
    fechaInicioExposicionRegional: "instancias.instanciaRegional.fechaInicioEvaluacionPresencial",
    fechaFinExposicionRegional: "instancias.instanciaRegional.fechaFinEvaluacionPresencial",
    fechaPromocionAProvincial: "instancias.instanciaRegional.fechaPromocionAProvincial",
    fechaInicioExposicionProvincial: "instancias.instanciaProvincial.fechaInicioEvaluacionPresencial",
    fechaFinExposicionProvincial: "instancias.instanciaProvincial.fechaFinEvaluacionPresencial",
    fechaPromocionANacional: "instancias.instanciaProvincial.fechaPromocionANacional",
    fechaInicioPostulacion: "fechaInicioPostulacionEvaluadores",
    fechaFinPostulacion: "fechaFinPostulacionEvaluadores",
    fechaInicioAsignacion: "fechaInicioAsignacionProyectos",
    fechaFinAsignacion: "fechaFinAsignacionProyectos",
}

export const siguienteFecha = {
    creada: fechasFeria.fechaInicio,
    iniciada: fechasFeria.fechaInicioEscolar,
    instanciaEscolar: fechasFeria.fechaFinEscolar,
    instanciaEscolar_Finalizada: fechasFeria.fechaInicioEvaluacionRegional,
    instanciaRegional_EnEvaluacion: fechasFeria.fechaFinEvaluacionRegional,
    instanciaRegional_EvaluacionFinalizada: fechasFeria.fechaInicioExposicionRegional,
    instanciaRegional_EnExposicion: fechasFeria.fechaFinExposicionRegional,
    instanciaRegional_ExposicionFinalizada: fechasFeria.fechaPromocionAProvincial,
    proyectosPromovidosA_instanciaProvincial: fechasFeria.fechaInicioExposicionProvincial,
    instanciaProvincial_EnExposicion: fechasFeria.fechaFinExposicionProvincial,
    instanciaProvincial_ExposicionFinalizada: fechasFeria.fechaPromocionANacional,
    proyectosPromovidosA_instanciaNacional: fechasFeria.fechaFin,
    finalizada: fechasFeria.fechaFin,
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