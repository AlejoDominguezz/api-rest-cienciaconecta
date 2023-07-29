import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { fechaAnteriorA, fechaPosteriorA } from "../helpers/db-validar.js";
import { check } from "express-validator";

export const bodyCrearFeriaValidator = [
    //validaciones de nombre
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("Nombre requerido")
        .trim()
        .isLength({ max: 50 })
        .withMessage("Nombre de Feria máximo 50 caracteres")
        .isString()
        .withMessage("Nombre formato incorrecto"),

    //validaciones de descripción
    body("descripcion")
        .trim()
        .notEmpty()
        .withMessage("Descripción requerida")
        .trim()
        .isLength({ max: 500 })
        .withMessage("Descripción máximo 500 caracteres")
        .isString()
        .withMessage("Descripción formato incorrecto"),

    //validaciones de logo
    // body("logo")
    //     .trim()
    //     .notEmpty()
    //     .withMessage("Logo requerido")
    //     .trim()
    //     .isLength({ max: 1000 })
    //     .withMessage("Longitud URL de logo máximo 1000 caracteres"),

    //validaciones de fecha de inicio de feria
    body("fechaInicioFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de inicio de Feria requerida")
        .isDate()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria"),
    check("fechaInicioFeria").custom(fechaPosteriorA(Date.now())),

    //validaciones de fecha de fin de feria
    body("fechaFinFeria")
        .trim()
        .notEmpty()
        .withMessage("Fecha de fin de Feria requerida")
        .isDate()
        .withMessage("Formato incorrecto de Fecha de inicio de Feria"),
    check("fechaFinFeria").custom(fechaPosteriorA(req.body.fechaInicioFeria)),

    // VALIDACIONES DE INSTANCIAS --------------------------------------------------------------------------
    // INSTANCIA ESCOLAR -----------------------------------------------------------------------------------
    //validaciones de fecha de inicio de inscripcion
    body('instancias.instanciaEscolar.fechaInicioInstancia')
        .notEmpty()
        .withMessage('La fecha de inicio de instancia escolar es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de instancia escolar debe ser una fecha válida'),
    check("instancias.instanciaEscolar.fechaInicioInstancia").custom(fechaPosteriorA(req.body.fechaInicioFeria)),
    check("instancias.instanciaEscolar.fechaInicioInstancia").custom(fechaAnteriorA(req.body.fechaFinFeria)),
    //validaciones de fecha de fin de inscripcion
    body('instancias.instanciaEscolar.fechaFinInstancia')
        .notEmpty()
        .withMessage('La fecha de fin de instancia escolar es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de instancia escolar debe ser una fecha válida'),
    check("instancias.instanciaEscolar.fechaFinInstancia").custom(fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaInicioInstancia)),
    //validaciones de estado
    body('instancias.instanciaRegional.estado')
        .notEmpty()
        .withMessage('El estado de instancia escolar es obligatorio')
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia regional debe tener un valor válido'),

    // INSTANCIA REGIONAL -----------------------------------------------------------------------------------------------------

    //validaciones de fecha de inicio de inscripcion
    body('instancias.instanciaRegional.fechaInicioActualizacion')
        .notEmpty()
        .withMessage('La fecha de inicio de actualización a instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de actualización a instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaInicioActualizacion").custom(fechaPosteriorA(req.body.instancias.instanciaEscolar.fechaFinInstancia)),
    //validaciones de fecha de fin de inscripcion
    body('instancias.instanciaRegional.fechaFinActualizacion')
        .notEmpty()
        .withMessage('La fecha de fin de actualización a instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de actualización a instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaFinActualizacion").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioActualizacion)),
    //validaciones de fecha de inicio de evaluacion teorica
    body('instancias.instanciaRegional.fechaInicioEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluacion teórica de instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de evaluacion teórica de instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaInicioEvaluacionTeorica").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinActualizacion)),
    //validaciones de fecha de fin de evaluacion teorica
    body('instancias.instanciaRegional.fechaFinEvaluacionTeorica')
        .notEmpty()
        .withMessage('La fecha de fin de evaluacion teórica de instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de evaluacion teórica de instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaFinEvaluacionTeorica").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica)),
    //validaciones de fecha de inicio de evaluacion presencial
    body('instancias.instanciaRegional.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluacion presencial de instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de evaluacion presencial de instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaInicioEvaluacionPresencial").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionTeorica)),
    //validaciones de fecha de fin de evaluacion presencial
    body('instancias.instanciaRegional.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluacion presencial de instancia regional es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de evaluacion presencial de instancia regional debe ser una fecha válida'),
    check("instancias.instanciaRegional.fechaFinEvaluacionPresencial").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaInicioEvaluacionPresencial)),
    //validaciones de cupo
    body('instancias.instanciaRegional.cupos')
        .optional()
        .isArray(),
    body('instancias.instanciaRegional.cupos.*.sede', 'El campo "sede" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId(),
    body('instancias.instanciaRegional.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId(),
    body('instancias.instanciaRegional.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),
    //validaciones de estado
    body('instancias.instanciaRegional.estado')
        .notEmpty()
        .withMessage('El estado de instancia regional es obligatorio')
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
            const sede = await Sede.findById(sedeId);
            if (!sede) { return Promise.reject('Una de las sedes proporcionadas no es válida');}
          } return true; }),
    
    // INSTANCIA PROVINCIAL -----------------------------------------------------------------------------
    
    //validaciones de fecha de inicio de actualizacion
    body('instancias.instanciaProvincial.fechaInicioActualizacion')
        .notEmpty()
        .withMessage('La fecha de inicio de actualización a instancia provincial es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de actualización a instancia provincial debe ser una fecha válida'),
    check("instancias.instanciaProvincial.fechaInicioActualizacion").custom(fechaPosteriorA(req.body.instancias.instanciaRegional.fechaFinEvaluacionPresencial)),
    //validaciones de fecha de fin de actualizacion
    body('instancias.instanciaProvincial.fechaFinActualizacion')
        .notEmpty()
        .withMessage('La fecha de fin de actualización a instancia provincial es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de actualización a instancia provincial debe ser una fecha válida'),
    check("instancias.instanciaProvincial.fechaFinActualizacion").custom(fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaInicioActualizacion)),
    //validaciones de fecha de inicio de evaluacion
    body('instancias.instanciaProvincial.fechaInicioEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de inicio de evaluacion presencial de instancia provincial es obligatoria')
        .isDate()
        .withMessage('La fecha de inicio de evaluacion presencial de instancia provincial debe ser una fecha válida'),
    check("instancias.instanciaProvincial.fechaInicioEvaluacionPresencial").custom(fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaFinActualizacion)),
    //validaciones de fecha de fin de evaluacion
    body('instancias.instanciaProvincial.fechaFinEvaluacionPresencial')
        .notEmpty()
        .withMessage('La fecha de fin de evaluacion presencial de instancia provincial es obligatoria')
        .isDate()
        .withMessage('La fecha de fin de evaluacion presencial de instancia provincial debe ser una fecha válida'),
    check("instancias.instanciaProvincial.fechaFinEvaluacionPresencial").custom(fechaPosteriorA(req.body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial)),
    //validaciones de cupo
    body('instancias.instanciaProvincial.cupos')
        .optional()
        .isArray(),
    body('instancias.instanciaProvincial.cupos.*.nivel', 'El campo "nivel" es requerido y debe ser un ObjectId válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isMongoId(),
    body('instancias.instanciaProvincial.cupos.*.cantidad', 'El campo "cantidad" es requerido y debe ser un número válido.')
        .if(body('instancias.instanciaProvincial.cupos').exists())
            .exists()
            .isInt(),
    //validaciones de estado
    body('instancias.instanciaProvincial.estado')
        .notEmpty()
        .withMessage('El estado de instancia provincial es obligatorio')
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de instancia provincial debe tener un valor válido'),
    //validaciones de sede
    body('instancias.instanciaProvincial.sede')
    .if(body('instancias.instanciaProvincial.sede').exists()) // Validamos solo si se proporciona el atributo 'sede'
    .isMongoId().withMessage('La sede debe ser un ObjectId válido')
    .custom(async (sedeId) => {
      const sede = await Sede.findById(sedeId);
      if (!sede) { return Promise.reject('La sede proporcionada no es válida'); }
      return true;
    }),
    
    // ------------------------------------------------------------------------------------------
    
    //validacion para fecha de inicio de postulacion de evaluadores
    body('fechaInicioPostulacionEvaluadores')
        .optional({ nullable: true })
        .isDate()
        .withMessage('La fecha de inicio de postulación de evaluadores debe ser una fecha válida'),
    check("fechaInicioPostulacionEvaluadores").custom(fechaPosteriorA(req.body.fechaInicioFeria)),
    //validacion para fecha de fin de postulacion de evaluadores
    body('fechaFinPostulacionEvaluadores')
        .optional({ nullable: true })
        .isDate()
        .withMessage('La fecha de fin de postulación de evaluadores debe ser una fecha válida'),
    check("fechaFinPostulacionEvaluadores").custom(fechaPosteriorA(req.body.fechaInicioPostulacionEvaluadores)),
    //validacion para fecha de inicio de asignacion de evaluadores a proyectos
    body('fechaInicioAsignacionProyectos')
        .optional({ nullable: true })
        .isDate()
        .withMessage('La fecha de inicio de asignación de proyectos debe ser una fecha válida'),
    check("fechaInicioAsignacionProyectos").custom(fechaPosteriorA(req.body.fechaFinPostulacionEvaluadores)),
    //validacion para fecha de fin de asignacion de evaluadores a proyectos
    body('fechaFinAsignacionProyectos')
        .optional({ nullable: true })
        .isDate()
        .withMessage('La fecha de fin de asignación de proyectos debe ser una fecha válida'),
    check("fechaFinAsignacionProyectos").custom(fechaPosteriorA(req.body.fechaInicioAsignacionProyectos)),

    //validacion de estado de feria
    body('estado')
        .notEmpty()
        .withMessage('El estado de feria es obligatorio')
        .isIn(['0', '1', '2', '3', '4', '5', '6'])
        .withMessage('El estado de feria debe tener un valor válido'),

    validarCampos,
];




