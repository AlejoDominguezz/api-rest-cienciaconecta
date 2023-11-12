import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { fechaAnteriorA, fechaPosteriorA } from "../helpers/db-validar.js";
import { check } from "express-validator";
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

    //validaciones de fecha de promoción de proyectos a instancia provincial
    body('instancias.instanciaRegional.fechaPromocionAProvincial')
        .notEmpty()
        .withMessage('La fecha de promoción de proyectos a instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de promoción de proyectos a instancia provincial debe ser una fecha válida')
        .custom((fechaPromocionAProvincial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionPresencial)(fechaPromocionAProvincial);
        })
        .custom((fechaPromocionAProvincial, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial)(fechaPromocionAProvincial);
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

    //validaciones de fecha de promoción de proyectos a instancia nacional
    body('instancias.instanciaProvincial.fechaPromocionANacional')
        .notEmpty()
        .withMessage('La fecha de promoción de proyectos a instancia nacional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de promoción de proyectos a instancia nacional debe ser una fecha válida')
        .custom((fechaPromocionANacional, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial)(fechaPromocionANacional);
        })
        .custom((fechaPromocionANacional, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaPromocionANacional);
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

    // //validaciones de sede
    // body('instancias.instanciaProvincial.sede')
    //     .if(body('instancias.instanciaProvincial.sede').exists())
    //         .isMongoId().withMessage('La sede debe ser un ObjectId válido')
    //         .custom(async (sedeId) => {
    //             const sede = await EstablecimientoEducativo.findById(sedeId);
    //             if (!sede) {
    //             return Promise.reject('La sede proporcionada no es válida');
    //             }
    //             return true;
    //         }),

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
    
    // Validación de criteriosEvaluacion -----------------------------------------------------------------------------------------
    
    body("criteriosEvaluacion")
    .notEmpty()
    .withMessage("Criterios de evaluación requeridos")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos un criterio de evaluación")
    .custom((criteriosEvaluacion) => {
        let totalPonderacionTeorica = 0;
        let totalPonderacionExposicion = 0;
    
        for (const rubrica of criteriosEvaluacion) {
          validarRubrica(rubrica);
    
          if (rubrica.exposicion) {
            // Sumar la ponderación de la rubrica de exposición al total de exposición
            totalPonderacionExposicion += rubrica.ponderacion;
          } else {
            // Sumar la ponderación de la rubrica teórica al total de teóricas
            totalPonderacionTeorica += rubrica.ponderacion;
          }
    
          // Validar que la ponderación de la rubrica sea un valor entre 0 y 100
          if (!Number.isInteger(rubrica.ponderacion) || rubrica.ponderacion < 0 || rubrica.ponderacion > 100) {
            throw new Error("La ponderación de la rubrica debe ser un número entero entre 0 y 100");
          }

          let totalPonderacionCriterios = 0;

          for (const criterio of rubrica.criterios) {
            totalPonderacionCriterios += criterio.ponderacion;

            // Validar que la ponderación de cada criterio sea un valor entre 0 y 100
            if (!Number.isInteger(criterio.ponderacion) || criterio.ponderacion < 0 || criterio.ponderacion > 100) {
                throw new Error("La ponderación de cada criterio debe ser un número entero entre 0 y 100");
            }
          }

          // Validar que la sumatoria de las ponderaciones de los criterios sea igual a 100
          if (totalPonderacionCriterios !== 100) {
              throw new Error("La sumatoria de las ponderaciones de los criterios de la rubrica debe ser igual a 100");
          }

        }
    
        // Validar que la sumatoria de las ponderaciones de las rubricas teóricas sea 100
        if (totalPonderacionTeorica !== 100) {
          throw new Error("La sumatoria de las ponderaciones de las rubricas teóricas debe ser igual a 100");
        }
    
        // Validar que la sumatoria de las ponderaciones de las rubricas de exposición sea 100
        if (totalPonderacionExposicion !== 100) {
          throw new Error("La sumatoria de las ponderaciones de las rubricas de exposición debe ser igual a 100");
        }
    
        return true;
      }),

    
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
        
    //validaciones de fecha de promoción de proyectos a instancia provincial
    body('instancias.instanciaRegional.fechaPromocionAProvincial')
        .notEmpty()
        .withMessage('La fecha de promoción de proyectos a instancia provincial es obligatoria')
        .isISO8601()
        .withMessage('La fecha de promoción de proyectos a instancia provincial debe ser una fecha válida')
        .custom((fechaPromocionAProvincial, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionPresencial)(fechaPromocionAProvincial);
        })
        .custom((fechaPromocionAProvincial, { req }) => {
            return fechaAnteriorA(req.body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial)(fechaPromocionAProvincial);
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

    //validaciones de fecha de promoción de proyectos a instancia nacional
    body('instancias.instanciaProvincial.fechaPromocionANacional')
        .notEmpty()
        .withMessage('La fecha de promoción de proyectos a instancia nacional es obligatoria')
        .isISO8601()
        .withMessage('La fecha de promoción de proyectos a instancia nacional debe ser una fecha válida')
        .custom((fechaPromocionANacional, { req }) => {
        return fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial)(fechaPromocionANacional);
        })
        .custom((fechaPromocionANacional, { req }) => {
            return fechaAnteriorA(req.body.fechaFinFeria)(fechaPromocionANacional);
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


    // //validaciones de sede
    // body('instancias.instanciaProvincial.sede')
    //     .if(body('instancias.instanciaProvincial.sede').exists())
    //         .isMongoId().withMessage('La sede debe ser un ObjectId válido')
    //         .custom(async (sedeId) => {
    //             const sede = await EstablecimientoEducativo.findById(sedeId);
    //             if (!sede) {
    //             return Promise.reject('La sede proporcionada no es válida');
    //             }
    //             return true;
    //         }),

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
    

    // Validación de criteriosEvaluacion --------------------------------------------------------------------------

    body("criteriosEvaluacion")
    .notEmpty()
    .withMessage("Criterios de evaluación requeridos")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos un criterio de evaluación")
    .custom((criteriosEvaluacion) => {
        let totalPonderacionTeorica = 0;
        let totalPonderacionExposicion = 0;
    
        for (const rubrica of criteriosEvaluacion) {
          validarRubrica(rubrica);
    
          if (rubrica.exposicion) {
            // Sumar la ponderación de la rubrica de exposición al total de exposición
            totalPonderacionExposicion += rubrica.ponderacion;
          } else {
            // Sumar la ponderación de la rubrica teórica al total de teóricas
            totalPonderacionTeorica += rubrica.ponderacion;
          }
    
          // Validar que la ponderación de la rubrica sea un valor entre 0 y 100
          if (!Number.isInteger(rubrica.ponderacion) || rubrica.ponderacion < 0 || rubrica.ponderacion > 100) {
            throw new Error("La ponderación de la rubrica debe ser un número entero entre 0 y 100");
          }

          let totalPonderacionCriterios = 0;

          for (const criterio of rubrica.criterios) {
            totalPonderacionCriterios += criterio.ponderacion;

            // Validar que la ponderación de cada criterio sea un valor entre 0 y 100
            if (!Number.isInteger(criterio.ponderacion) || criterio.ponderacion < 0 || criterio.ponderacion > 100) {
                throw new Error("La ponderación de cada criterio debe ser un número entero entre 0 y 100");
            }
          }

          // Validar que la sumatoria de las ponderaciones de los criterios sea igual a 100
          if (totalPonderacionCriterios !== 100) {
              throw new Error("La sumatoria de las ponderaciones de los criterios de la rubrica debe ser igual a 100");
          }

        }
    
        // Validar que la sumatoria de las ponderaciones de las rubricas teóricas sea 100
        if (totalPonderacionTeorica !== 100) {
          throw new Error("La sumatoria de las ponderaciones de las rubricas teóricas debe ser igual a 100");
        }
    
        // Validar que la sumatoria de las ponderaciones de las rubricas de exposición sea 100
        if (totalPonderacionExposicion !== 100) {
          throw new Error("La sumatoria de las ponderaciones de las rubricas de exposición debe ser igual a 100");
        }
    
        return true;
      }),

    
    validarCampos,

];



// Función para validar una rubrica --------------------------------------------------------------------------------
const validarRubrica = (rubrica) => {
    if (
      !rubrica ||
      !rubrica.nombreRubrica ||
      typeof rubrica.nombreRubrica !== "string" ||
      !rubrica.criterios ||
      !Array.isArray(rubrica.criterios) ||
      rubrica.criterios.length === 0 ||
      !rubrica.ponderacion ||
      !Number.isInteger(parseInt(rubrica.ponderacion)) ||
      (parseInt(rubrica.ponderacion)) < 0 ||
      (parseInt(rubrica.ponderacion)) > 100 ||
      typeof rubrica.exposicion !== "boolean"
    ) {
      throw new Error(
        "Cada rubrica debe tener un nombreRubrica, al menos un criterio, una ponderación numérica entera entre 0 y 100, y un atributo 'exposicion' booleano"
      );
    }
  
    for (const criterioItem of rubrica.criterios) {
      if (
        !criterioItem ||
        !criterioItem.nombre ||
        typeof criterioItem.nombre !== "string" ||
        !criterioItem.opciones ||
        !Array.isArray(criterioItem.opciones) ||
        criterioItem.opciones.length === 0 ||
        !criterioItem.ponderacion ||
        !Number.isInteger(parseInt(criterioItem.ponderacion)) ||
        (parseInt(criterioItem.ponderacion)) < 0 ||
        (parseInt(criterioItem.ponderacion)) > 100
      ) {
        throw new Error(
          "Cada criterio de evaluación debe tener un nombre, opciones válidas, ponderación numérica entera entre 0 y 100"
        );
      }
  
      for (const opcion of criterioItem.opciones) {
        if (
          !opcion ||
          !opcion.nombre ||
          typeof opcion.nombre !== "string" ||
          !Number.isInteger(parseInt(opcion.puntaje)) ||
          (parseInt(opcion.puntaje)) < 0 ||
          (parseInt(opcion.puntaje)) > 100
        ) {
          throw new Error(
            "Cada opción debe tener un nombre en string y un puntaje entero entre 0 y 100"
          );
        }
      }
    }
  };