import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";


export const crearCategoriaValidator = [
    body('nombre').isLength({ max: 150 }).withMessage('El campo nombre no debe tener más de 150 caracteres'),
    body('abreviatura').isLength({ max: 12 }).withMessage('El campo abreviatura no debe tener más de 12 caracteres'),
    body('color').custom((value) => {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(value)) {
        throw new Error('El campo color debe estar en formato hexadecimal');
      }
      return true;
    }),
    validarCampos
];

export const eliminarCategoriaValidator = [
    param('id')
    .isMongoId()
    .withMessage('El ID ingresado como parámetro no es Mongo ID válido'),

    validarCampos
]