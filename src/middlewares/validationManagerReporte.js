import { Feria } from "../models/Feria.js";
import { validarCampos } from "./validar-campos.js";
import { body, param, query } from "express-validator";

export const reportePuntajePromedio = [

    query('filtro')
        .notEmpty()
        .withMessage("El parámetro filtro es requerido")
        .isIn(["categoria", "nivel", "departamento"])
        .withMessage("Query Param Inválido"),

    query("feria")
        .optional()
        .isMongoId()
        .withMessage("El ID de Feria ingresado no es un Mongo ID válido")
        .custom(async (feria, { req }) => {
            const _feria = await Feria.findById(feria);
            if(!_feria){
                return Promise.reject('El ID de Feria ingresado no corresponde a ninguna feria existente');
            } else {
                return true;
            }
        }),

    validarCampos
];
