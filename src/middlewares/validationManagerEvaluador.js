import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { check } from "express-validator";
import { Categoria } from "../models/Categoria.js";
import { Nivel } from "../models/Nivel.js";
import { Feria } from "../models/Feria.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";
import { Types } from 'mongoose'
import { checkEstablecimientoIsSede } from '../controllers/establecimientos.controller.js'

export const bodyPostularEvaluadorValidator = [
    //validaciones de docente -----------------------------------------------------------------
    body("docente")
        .isBoolean()
        .withMessage("El valor docente debe ser un booleano")
        .notEmpty()
        .withMessage("Campo docente requerido"),


    //validaciones de niveles -----------------------------------------------------------------

    body('niveles')
    .custom((value, { req }) => {
      const docente = req.body.docente;
      // Verifica si el campo docente es true
      if (docente === true) {
        // Si es true, asegurarse de que niveles se reciba y sea un array válido
        if (!value || !Array.isArray(value) || value.length === 0) {
          throw new Error('Se debe indicar al menos un nivel si el docente es verdadero (true)');
        }
        // Verifica si todos los valores en el array son ObjectIds válidos
        const areValidObjectIds = value.every((nivelId) => Types.ObjectId.isValid(nivelId));

        if (!areValidObjectIds) {
          throw new Error('Al menos uno de los niveles proporcionados no es un ObjectId válido');
        }

        // Verifica si los ObjectIds existen en la colección Nivel de la base de datos
        return Nivel.countDocuments({ _id: { $in: value } })
          .then((count) => {
            if (count !== value.length) {
              throw new Error('Al menos uno de los niveles proporcionados no existe en la base de datos');
            }
          });
      } else if (docente === false) {
        // Si docente es false, niveles no debe recibir ningún valor
        if (value && value.length > 0) {
          throw new Error('No se deben proporcionar niveles si el docente es falso (false)');
        }
      }
      return true; // En otros casos, se permite o se omite la validación
    }),


    // body("niveles")
    // .isArray()
    // .withMessage("El campo niveles debe ser un array")
    // .optional(), // Campo opcional

    // body('niveles.*')
    // .isMongoId()
    // .withMessage('Al menos uno de los niveles proporcionados no es un ObjectId válido')
    // .optional(), // Campo opcional si no se proporciona

    // body('niveles')
    // .custom(async (value) => {
    //     // Verifica si el campo niveles es un array vacío o no se proporciona
    //     if (!value || value.length === 0) {
    //     return true; // Campo opcional si no se proporciona o es un array vacío
    //     }

    //     // Verifica si los ObjectIds existen en la colección Nivel de la base de datos
    //     const existingNiveles = await Nivel.find({ _id: { $in: value } });
    //     if (existingNiveles.length !== value.length) {
    //     throw new Error('Al menos uno de los niveles proporcionados no existe en la base de datos');
    //     }

    //     return true;
    // })
    // .withMessage('Al menos uno de los niveles proporcionados no existe en la base de datos')
    // .optional(),

    //validaciones de categorias -----------------------------------------------------------------
    body("categorias")
    .isArray()
    .withMessage("El campo categorias debe ser un array")
    .optional(), // Campo opcional

    body('categorias.*')
    .isMongoId()
    .withMessage('Al menos uno de las categorias proporcionadas no es un ObjectId válido')
    .optional(), // Campo opcional si no se proporciona

    body('categorias')
    .custom(async (value) => {
        // Verifica si el campo categorias es un array vacío o no se proporciona
        if (!value || value.length === 0) {
        return true; // Campo opcional si no se proporciona o es un array vacío
        }

        // Verifica si los ObjectIds existen en la colección Categoria de la base de datos
        const existingCategorias = await Categoria.find({ _id: { $in: value } });
        if (existingCategorias.length !== value.length) {
        throw new Error('Al menos uno de las categorias proporcionadas no existe en la base de datos');
        }

        return true;
    })
    .withMessage('Al menos uno de las categorias proporcionadas no existe en la base de datos')
    .optional(),


    // Validación del campo sede -----------------------------------------------------------------
    body('sede')
    .isMongoId()
    .withMessage('El valor de sede debe ser un ObjectId válido')
    .custom(async (value) => {

        const isSedeValid = await checkEstablecimientoIsSede(value);

        if (!isSedeValid) {
        throw new Error('El establecimiento elegido no es una sede actual');
        }

      })
    .withMessage('El establecimiento elegido no es una sede actual')
    .notEmpty()
    .withMessage('Se debe indicar la sede en la cual se quiere evaluar'),

   // Validación del campo antecedentes
    body('antecedentes')
    .optional()
    .custom((value) => {
      // Si no se proporciona el campo, está bien (opcional)
      if (!value) {
        return true;
      }
      // Si se proporciona el campo, asegurarse de que no sea un array vacío
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('El campo antecedentes no puede ser un array vacío');
      }
      // Validar que cada elemento del array sea un string de 4 caracteres
      if (!value.every((antecedente) => typeof antecedente === 'string' && antecedente.length === 4)) {
        throw new Error('Cada antecedente debe ser un string de 4 caracteres');
      }
      return true;
    })
    .withMessage('Si se proporciona, el campo antecedentes no puede ser un array vacío y cada antecedente debe ser un string de 4 caracteres'),
    
    validarCampos,

];