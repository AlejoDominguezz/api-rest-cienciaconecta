import { Feria } from "../models/Feria.js";
import { validarCampos } from "./validar-campos.js";
import { body, param, query } from "express-validator";

export const reporteFiltroFeria = [

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


export const reporteFeria = [

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


export const reporteFiltroFeriaPuntaje = [

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

    query('puntaje')
        .notEmpty()
        .withMessage("El parámetro puntaje es requerido")
        .isInt({ min: 0, max: 200 })
        .withMessage("El puntaje debe estar en el rango de 0 a 200"),

    validarCampos
];
