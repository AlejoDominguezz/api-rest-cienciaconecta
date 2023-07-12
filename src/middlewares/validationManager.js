import {body, param} from 'express-validator';
import { validarCampos } from './validar-campos.js';
import axios from 'axios';

export const bodyRegisterValidator = [
    body('email', "Formato de email incorrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password', "Mínimo 8 caracteres")
        .trim()
        .isLength({min: 8, max: 20}),
        // 1 mayúscula y 1 número
    body('password', "Formato de contraseña incorrecto") // sacar 🥰
        .custom((value,  {req}) => {
            if (value !== req.body.repassword)
                throw new Error('No coinciden las contraseñas')    
            return value 
        }),
    body('nombre', "Nombre requerido")
        .trim()
        .notEmpty(),
    body('nombre', "Nombre máximo 30 caracteres")
        .trim()
        .isLength({max:30}),
    body('apellido', "Apellido requerido")
        .trim()
        .notEmpty(),
    body('apellido', "Apellido máximo 30 caracteres")
        .trim()
        .isLength({max:30}),
    body('cuil', "Cuil requerido")
        .trim()
        .notEmpty(),
    body('cuil', "Formato de Cuil incorrecto")
        .trim()
        .isLength({min: 10, max: 11}),
    body('dni', "DNI requerido")
        .trim()
        .notEmpty(),
    body('dni', "Formato de DNI incorrecto")
        .trim()
        .isLength({min: 7, max: 8}),
    validarCampos,
]

export const bodyLoginValidator = [
    body('email', "Formato de email incorrecto")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password', "Mínimo 6 caracteres")
        .trim()
        .isLength({min: 6}),
    validarCampos,
];