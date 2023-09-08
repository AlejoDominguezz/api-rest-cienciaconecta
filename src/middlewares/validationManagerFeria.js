import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { fechaAnteriorA, fechaPosteriorA } from "../helpers/db-validar.js";
import { check } from "express-validator";
import { Sede } from "../models/Sede.js";
import { Nivel } from "../models/Nivel.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";

const fechaActual = Date.now();
const fechaActualAjustada = new Date(fechaActual);
fechaActualAjustada.setHours(0, 0, 0, 0); // Ajustar a las 00:00:00

export const bodyCrearFeriaValidator = [
    //validaciones de nombre
    body("nombre")
        .isString()
        .withMessage("Nombre formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Nombre requerido")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Nombre de Feria máximo 100 caracteres"),


    //validaciones de descripción
    body("descripcion")
        .isString()
        .withMessage("Descripción formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Descripción requerida")
        .trim()
        .isLength({ max: 500 })
        .withMessage("Descripción máximo 500 caracteres"),

    //validaciones de logo
    body("logo")
        .if(body('logo').exists())
            .notEmpty()
            .withMessage("Logo requerido")
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Longitud URL de logo máximo 1000 caracteres")
            .isURL()
            .withMessage("URL inválido"),        

    //validaciones de fecha de inicio de feria
    body("fechaInicioFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de inicio de Feria requerida")
        .isISO8601()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria"),
    check("fechaInicioFeria").custom(fechaPosteriorA(fechaActualAjustada)),

    //validaciones de fecha de fin de feria
    body("fechaFinFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de fin de Feria requerida")
        .isISO8601()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria")
        .custom((fechaFinFeria, { req }) => {
            const fechaInicioFeria = req.body.fechaInicioFeria;
            return fechaPosteriorA(fechaInicioFeria)(fechaFinFeria);
          }),

    // VALIDACIONES DE INSTANCIAS --------------------------------------------------------------------------
    // INSTANCIA ESCOLAR -----------------------------------------------------------------------------------
    //validaciones de fecha de inicio de instancia
    body('instancias.instanciaEscolar.fechaInicioInstancia')
        .notEmpty()
        .withMessage('La fecha de inicio de instancia escolar es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de instancia escolar debe ser una fecha válida')
        .custom((fechaInicioInstancia, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioFeria)(fechaInicioInstancia);
        })
        .custom((fechaInicioInstancia, { req }) => {
        return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioInstancia);
        }),

    //validaciones de fecha de fin de instancia
    body('instancias.instanciaEscolar.fechaFinInstancia')
        .notEmpty()
        .withMessage('La fecha de fin de instancia escolar es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de instancia escolar debe ser una fecha válida')
        .custom((fechaFinInstancia, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaInicioInstancia)(fechaFinInstancia);
        })
        .custom((fechaFinInstancia, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinInstancia);
            }),

    // Validaciones de estado (opcional)
    body('instancias.instanciaRegional.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia regional debe tener un valor válido'),
    // INSTANCIA REGIONAL -----------------------------------------------------------------------------------------------------

    //validaciones de fecha de inicio de evaluacion teorica
    body('instancias.instanciaRegional.fechaInicioEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación teórica de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación teórica de instancia regional debe ser una fecha válida')
        .custom((fechaInicioEvaluacionTeorica, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaFinInstancia)(fechaInicioEvaluacionTeorica);
        })
        .custom((fechaInicioEvaluacionTeorica, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionTeorica);
            }),

    //validaciones de fecha de fin de evaluacion teorica
    body('instancias.instanciaRegional.fechaFinEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación teórica de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación teórica de instancia regional debe ser una fecha válida')
        .custom((fechaFinEvaluacionTeorica, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinEvaluacionTeorica);
        })
        .custom((fechaFinEvaluacionTeorica, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionTeorica);
            }),

    //validaciones de fecha de inicio de evaluacion presencial
    body('instancias.instanciaRegional.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación presencial de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación presencial de instancia regional debe ser una fecha válida')
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionTeorica)(fechaInicioEvaluacionPresencial);
        })
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionPresencial);
            }),

    //validaciones de fecha de fin de evaluacion presencial
    body('instancias.instanciaRegional.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación presencial de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación presencial de instancia regional debe ser una fecha válida')
        .custom((fechaFinEvaluacionPresencial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionPresencial)(fechaFinEvaluacionPresencial);
        })
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionPresencial);
            }),

    //validaciones de cupo
    body('instancias.instanciaRegional.cupos')
        .optional()
        .isArray()
        .custom((cupos, { req }) => {
            const seenSedeNivelPairs = new Set();
    
            for (const cupo of cupos) {
                const sedeNivelPair = `${cupo.sede}-${cupo.nivel}`;
                if (seenSedeNivelPairs.has(sedeNivelPair)) {
                    return Promise.reject('No puede haber cupos con la misma sede y el mismo nivel');
                }
                seenSedeNivelPairs.add(sedeNivelPair);
            }
            return true;
        })
        .withMessage('Los cupos no pueden tener la misma sede y el mismo nivel al mismo tiempo'),
        
    body('instancias.instanciaRegional.cupos.*.sede', 'El campo "sede" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom((value, { req }) => {
                const sedeIds = req.body.instancias.instanciaRegional.sedes;
                return sedeIds.includes(value.toString()); // Convertir a string para comparar
            })
            .withMessage('La sede en los cupos debe ser una de las sedes elegidas'),
    body('instancias.instanciaRegional.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom(async (value) => {
                const nivelExists = await Nivel.exists({ _id: value });
                if (!nivelExists) {
                    return Promise.reject('El nivel proporcionado no es válido');
                }
                return true;
            }),
    body('instancias.instanciaRegional.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),
    

    //validaciones de estado
    body('instancias.instanciaRegional.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia regional debe tener un valor válido'),

    //validaciones de sedes
    body('instancias.instanciaRegional.sedes')
        .notEmpty()
        .withMessage('Se requiere al menos una sede para instancia regional')
        .isArray()
        .withMessage('Las sedes deben ser un array de ObjectId')
        .custom(async (sedesIds) => {
            // Validar cada ObjectId de las sedes en el array
            for (const sedeId of sedesIds) {
            const sede = await EstablecimientoEducativo.findById(sedeId);
            if (!sede) {
                return Promise.reject('Una de las sedes proporcionadas no es válida');
            }
            }
            return true;
    }),

    
    // INSTANCIA PROVINCIAL -----------------------------------------------------------------------------
    
    //validaciones de fecha de inicio de evaluacion
    body('instancias.instanciaProvincial.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación presencial de instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación presencial de instancia provincial debe ser una fecha válida')
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionPresencial)(fechaInicioEvaluacionPresencial);
        })
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionPresencial);
            }),

    //validaciones de fecha de fin de evaluacion
    body('instancias.instanciaProvincial.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación presencial de instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación presencial de instancia provincial debe ser una fecha válida')
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial)(fechaFinEvaluacionPresencial);
        })
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionPresencial);
            }),

    //validaciones de cupo
    body('instancias.instanciaProvincial.cupos')
        .optional()
        .isArray()
        .custom((cupos, { req }) => {
            const seenNiveles = new Set();
            for (const cupo of cupos) {
                if (seenNiveles.has(cupo.nivel)) {
                    return Promise.reject('No puede haber cupos con el mismo nivel en la instancia provincial');
                }
                seenNiveles.add(cupo.nivel);
            }
            return true;})
        .withMessage('Los cupos no pueden tener el mismo nivel en la instancia provincial'),

    body('instancias.instanciaProvincial.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom(async (value) => {
                const nivelExists = await Nivel.exists({ _id: value });
                if (!nivelExists) {
                    return Promise.reject('El nivel proporcionado no es válido');
                }
                return true;
            }),
    body('instancias.instanciaProvincial.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),

    //validaciones de estado
    body('instancias.instanciaProvincial.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia provincial debe tener un valor válido'),

    //validaciones de sede
    body('instancias.instanciaProvincial.sede')
        .if(body('instancias.instanciaProvincial.sede').exists())
            .isMongoId().withMessage('La sede debe ser un ObjectId válido')
            .custom(async (sedeId) => {
                const sede = await EstablecimientoEducativo.findById(sedeId);
                if (!sede) {
                return Promise.reject('La sede proporcionada no es válida');
                }
                return true;
            }),

    // ------------------------------------------------------------------------------------------
    
    //validacion para fecha de inicio de postulacion de evaluadores
    body('fechaInicioPostulacionEvaluadores')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de inicio de postulación de evaluadores debe ser una fecha válida')
        .custom((fechaInicioPostulacionEvaluadores, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioFeria)(fechaInicioPostulacionEvaluadores);
        })
        .custom((fechaInicioPostulacionEvaluadores, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaInicioPostulacionEvaluadores);
            }),

    //validacion para fecha de fin de postulacion de evaluadores
    body('fechaFinPostulacionEvaluadores')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de fin de postulación de evaluadores debe ser una fecha válida')
        .custom((fechaFinPostulacionEvaluadores, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioPostulacionEvaluadores)(fechaFinPostulacionEvaluadores);
        })
        .custom((fechaFinPostulacionEvaluadores, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinPostulacionEvaluadores);
            }),

    //validacion para fecha de inicio de asignacion de evaluadores a proyectos
    body('fechaInicioAsignacionProyectos')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de inicio de asignación de proyectos debe ser una fecha válida')
        .custom((fechaInicioAsignacionProyectos, { req }) => {
        return fechaPosteriorA(req.body.fechaFinPostulacionEvaluadores)(fechaInicioAsignacionProyectos);
        })
        .custom((fechaInicioAsignacionProyectos, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaInicioAsignacionProyectos);
            }),

    //validacion para fecha de fin de asignacion de evaluadores a proyectos
    body('fechaFinAsignacionProyectos')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de fin de asignación de proyectos debe ser una fecha válida')
        .custom((fechaFinAsignacionProyectos, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioAsignacionProyectos)(fechaFinAsignacionProyectos);
        })
        .custom((fechaFinAsignacionProyectos, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinAsignacionProyectos);
            }),
    
    // Validación de criteriosEvaluacion
    body("criteriosEvaluacion")
        .notEmpty()
        .withMessage("Criterios de evaluación requeridos")
        .isArray({ min: 1 })
        .withMessage("Debe proporcionar al menos un criterio de evaluación")
        .custom((criteriosEvaluacion) => {
        let totalPonderacion = 0;

        for (const criterio of criteriosEvaluacion) {
            validarCriterio(criterio);
            // Sumar la ponderación del criterio actual al total
            for (const criterioItem of criterio.criterios) {
            totalPonderacion += criterioItem.ponderacion;
            }
        }
        // Validar que la sumatoria de las ponderaciones sea igual a 1
        if (totalPonderacion !== 1) {
            throw new Error(
            "La sumatoria de las ponderaciones de los criterios debe ser igual a 1"
            );
        }
        return true;
        }),


    //validacion de estado de feria
    body('estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de feria debe tener un valor válido'),

    
    validarCampos,

];

export const bodyModificarFeriaValidator = [
    //validaciones de nombre
    body("nombre")
        .isString()
        .withMessage("Nombre formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Nombre requerido")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Nombre de Feria máximo 100 caracteres"),


    //validaciones de descripción
    body("descripcion")
        .isString()
        .withMessage("Descripción formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Descripción requerida")
        .trim()
        .isLength({ max: 500 })
        .withMessage("Descripción máximo 500 caracteres"),

    //validaciones de logo
    body("logo")
        .if(body('logo').exists())
            .notEmpty()
            .withMessage("Logo requerido")
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Longitud URL de logo máximo 1000 caracteres")
            .isURL()
            .withMessage("URL inválido"),        

    //validaciones de fecha de inicio de feria
    body("fechaInicioFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de inicio de Feria requerida")
        .isISO8601()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria"),
    //check("fechaInicioFeria").custom(fechaPosteriorA(fechaActualAjustada)),

    //validaciones de fecha de fin de feria
    body("fechaFinFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de fin de Feria requerida")
        .isISO8601()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria")
        .custom((fechaFinFeria, { req }) => {
            const fechaInicioFeria = req.body.fechaInicioFeria;
            return fechaPosteriorA(fechaInicioFeria)(fechaFinFeria);
          }),

    // VALIDACIONES DE INSTANCIAS --------------------------------------------------------------------------
    // INSTANCIA ESCOLAR -----------------------------------------------------------------------------------
    //validaciones de fecha de inicio de instancia
    body('instancias.instanciaEscolar.fechaInicioInstancia')
        .notEmpty()
        .withMessage('La fecha de inicio de instancia escolar es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de instancia escolar debe ser una fecha válida')
        .custom((fechaInicioInstancia, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioFeria)(fechaInicioInstancia);
        })
        .custom((fechaInicioInstancia, { req }) => {
        return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioInstancia);
        }),

    //validaciones de fecha de fin de instancia
    body('instancias.instanciaEscolar.fechaFinInstancia')
        .notEmpty()
        .withMessage('La fecha de fin de instancia escolar es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de instancia escolar debe ser una fecha válida')
        .custom((fechaFinInstancia, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaInicioInstancia)(fechaFinInstancia);
        })
        .custom((fechaFinInstancia, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinInstancia);
            }),

    // Validaciones de estado (opcional)
    body('instancias.instanciaRegional.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia regional debe tener un valor válido'),
    // INSTANCIA REGIONAL -----------------------------------------------------------------------------------------------------

    //validaciones de fecha de inicio de evaluacion teorica
    body('instancias.instanciaRegional.fechaInicioEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación teórica de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación teórica de instancia regional debe ser una fecha válida')
        .custom((fechaInicioEvaluacionTeorica, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaFinInstancia)(fechaInicioEvaluacionTeorica);
        })
        .custom((fechaInicioEvaluacionTeorica, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionTeorica);
            }),

    //validaciones de fecha de fin de evaluacion teorica
    body('instancias.instanciaRegional.fechaFinEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación teórica de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación teórica de instancia regional debe ser una fecha válida')
        .custom((fechaFinEvaluacionTeorica, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinEvaluacionTeorica);
        })
        .custom((fechaFinEvaluacionTeorica, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionTeorica);
            }),

    //validaciones de fecha de inicio de evaluacion presencial
    body('instancias.instanciaRegional.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación presencial de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación presencial de instancia regional debe ser una fecha válida')
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionTeorica)(fechaInicioEvaluacionPresencial);
        })
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionPresencial);
            }),

    //validaciones de fecha de fin de evaluacion presencial
    body('instancias.instanciaRegional.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación presencial de instancia regional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación presencial de instancia regional debe ser una fecha válida')
        .custom((fechaFinEvaluacionPresencial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionPresencial)(fechaFinEvaluacionPresencial);
        })
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionPresencial);
            }),

    //validaciones de cupo
    body('instancias.instanciaRegional.cupos')
        .optional()
        .isArray()
        .custom((cupos, { req }) => {
            const seenSedeNivelPairs = new Set();
    
            for (const cupo of cupos) {
                const sedeNivelPair = `${cupo.sede}-${cupo.nivel}`;
                if (seenSedeNivelPairs.has(sedeNivelPair)) {
                    return Promise.reject('No puede haber cupos con la misma sede y el mismo nivel');
                }
                seenSedeNivelPairs.add(sedeNivelPair);
            }
            return true;
        })
        .withMessage('Los cupos no pueden tener la misma sede y el mismo nivel al mismo tiempo'),
        
    body('instancias.instanciaRegional.cupos.*.sede', 'El campo "sede" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom((value, { req }) => {
                const sedeIds = req.body.instancias.instanciaRegional.sedes;
                return sedeIds.includes(value.toString()); // Convertir a string para comparar
            })
            .withMessage('La sede en los cupos debe ser una de las sedes elegidas'),
    body('instancias.instanciaRegional.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom(async (value) => {
                const nivelExists = await Nivel.exists({ _id: value });
                if (!nivelExists) {
                    return Promise.reject('El nivel proporcionado no es válido');
                }
                return true;
            }),
    body('instancias.instanciaRegional.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),
    

    //validaciones de estado
    body('instancias.instanciaRegional.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia regional debe tener un valor válido'),

    //validaciones de sedes
    body('instancias.instanciaRegional.sedes')
        .notEmpty()
        .withMessage('Se requiere al menos una sede para instancia regional')
        .isArray()
        .withMessage('Las sedes deben ser un array de ObjectId')
        .custom(async (sedesIds) => {
            // Validar cada ObjectId de las sedes en el array
            for (const sedeId of sedesIds) {
            const sede = await EstablecimientoEducativo.findById(sedeId);
            if (!sede) {
                return Promise.reject('Una de las sedes proporcionadas no es válida');
            }
            }
            return true;
    }),

    
    // INSTANCIA PROVINCIAL -----------------------------------------------------------------------------
    
    //validaciones de fecha de inicio de evaluacion
    body('instancias.instanciaProvincial.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluación presencial de instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio de evaluación presencial de instancia provincial debe ser una fecha válida')
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionPresencial)(fechaInicioEvaluacionPresencial);
        })
        .custom((fechaInicioEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaInicioEvaluacionPresencial);
            }),

    //validaciones de fecha de fin de evaluacion
    body('instancias.instanciaProvincial.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluación presencial de instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin de evaluación presencial de instancia provincial debe ser una fecha válida')
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial)(fechaFinEvaluacionPresencial);
        })
        .custom((fechaFinEvaluacionPresencial, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaFinEvaluacionPresencial);
            }),

    //validaciones de cupo
    body('instancias.instanciaProvincial.cupos')
        .optional()
        .isArray()
        .custom((cupos, { req }) => {
            const seenNiveles = new Set();
            for (const cupo of cupos) {
                if (seenNiveles.has(cupo.nivel)) {
                    return Promise.reject('No puede haber cupos con el mismo nivel en la instancia provincial');
                }
                seenNiveles.add(cupo.nivel);
            }
            return true;})
        .withMessage('Los cupos no pueden tener el mismo nivel en la instancia provincial'),

    body('instancias.instanciaProvincial.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId()
            .custom(async (value) => {
                const nivelExists = await Nivel.exists({ _id: value });
                if (!nivelExists) {
                    return Promise.reject('El nivel proporcionado no es válido');
                }
                return true;
            }),
    body('instancias.instanciaProvincial.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),

    //validaciones de estado
    body('instancias.instanciaProvincial.estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia provincial debe tener un valor válido'),

    //validaciones de sede
    body('instancias.instanciaProvincial.sede')
        .if(body('instancias.instanciaProvincial.sede').exists())
            .isMongoId().withMessage('La sede debe ser un ObjectId válido')
            .custom(async (sedeId) => {
                const sede = await EstablecimientoEducativo.findById(sedeId);
                if (!sede) {
                return Promise.reject('La sede proporcionada no es válida');
                }
                return true;
            }),

    // ------------------------------------------------------------------------------------------
    
    //validacion para fecha de inicio de postulacion de evaluadores
    body('fechaInicioPostulacionEvaluadores')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de inicio de postulación de evaluadores debe ser una fecha válida')
        .custom((fechaInicioPostulacionEvaluadores, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioFeria)(fechaInicioPostulacionEvaluadores);
        })
        .custom((fechaInicioPostulacionEvaluadores, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaInicioPostulacionEvaluadores);
            }),

    //validacion para fecha de fin de postulacion de evaluadores
    body('fechaFinPostulacionEvaluadores')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de fin de postulación de evaluadores debe ser una fecha válida')
        .custom((fechaFinPostulacionEvaluadores, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioPostulacionEvaluadores)(fechaFinPostulacionEvaluadores);
        })
        .custom((fechaFinPostulacionEvaluadores, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinPostulacionEvaluadores);
            }),

    //validacion para fecha de inicio de asignacion de evaluadores a proyectos
    body('fechaInicioAsignacionProyectos')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de inicio de asignación de proyectos debe ser una fecha válida')
        .custom((fechaInicioAsignacionProyectos, { req }) => {
        return fechaPosteriorA(req.body.fechaFinPostulacionEvaluadores)(fechaInicioAsignacionProyectos);
        })
        .custom((fechaInicioAsignacionProyectos, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaInicioAsignacionProyectos);
            }),

    //validacion para fecha de fin de asignacion de evaluadores a proyectos
    body('fechaFinAsignacionProyectos')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La fecha de fin de asignación de proyectos debe ser una fecha válida')
        .custom((fechaFinAsignacionProyectos, { req }) => {
        return fechaPosteriorA(req.body.fechaInicioAsignacionProyectos)(fechaFinAsignacionProyectos);
        })
        .custom((fechaFinAsignacionProyectos, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)(fechaFinAsignacionProyectos);
            }),
    
    // Validación de criteriosEvaluacion
    body("criteriosEvaluacion")
        .notEmpty()
        .withMessage("Criterios de evaluación requeridos")
        .isArray({ min: 1 })
        .withMessage("Debe proporcionar al menos un criterio de evaluación")
        .custom((criteriosEvaluacion) => {
        let totalPonderacion = 0;

        for (const criterio of criteriosEvaluacion) {
            validarCriterio(criterio);
            // Sumar la ponderación del criterio actual al total
            for (const criterioItem of criterio.criterios) {
            totalPonderacion += criterioItem.ponderacion;
            }
        }
        // Validar que la sumatoria de las ponderaciones sea igual a 1
        if (totalPonderacion !== 1) {
            throw new Error(
            "La sumatoria de las ponderaciones de los criterios debe ser igual a 1"
            );
        }
        return true;
        }),


    //validacion de estado de feria
    body('estado')
        .optional() // Marcar el campo como opcional
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de feria debe tener un valor válido'),

    
    validarCampos,

];

// Función para validar cada criterio de evaluación individualmente
const validarCriterio = (criterio) => {
    if (
      !criterio ||
      !criterio.nombreRubrica ||
      typeof criterio.nombreRubrica !== "string" ||
      !criterio.criterios ||
      !Array.isArray(criterio.criterios) ||
      criterio.criterios.length === 0
    ) {
      throw new Error(
        "Cada criterio de evaluación debe tener una nombreRubrica y al menos un criterio"
      );
    }
  
    for (const criterioItem of criterio.criterios) {
      if (
        !criterioItem ||
        !criterioItem.nombre ||
        typeof criterioItem.nombre !== "string" ||
        !criterioItem.opciones ||
        !Array.isArray(criterioItem.opciones) ||
        criterioItem.opciones.length === 0 ||
        !criterioItem.ponderacion ||
        typeof criterioItem.ponderacion !== "number" ||
        criterioItem.ponderacion < 0 ||
        criterioItem.ponderacion > 1
      ) {
        throw new Error(
          "Cada criterio de evaluación debe tener un nombre, opciones válidas y ponderación numérica entre 0 y 1"
        );
      }
    }
  };

