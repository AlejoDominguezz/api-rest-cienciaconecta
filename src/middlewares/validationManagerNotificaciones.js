import { validarCampos } from "./validar-campos.js";
import { body } from "express-validator";

export const notificacionesLeidasValidator = [

    body('leidas')
        .isArray({ min: 1 })
        .withMessage("El valor ingresado debe ser un array con al menos un elemento")
        .isMongoId({ each: true })
        .withMessage("Todos los elementos del array deben ser Mongo ID válidos"),

    validarCampos
];
