import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { getDepartamentosForValidation } from "../controllers/departamentos.controller.js"
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";

export const bodyCrearEstablecimientoValidator = [
    //validaciones de nombre
    body("nombre")
        .isString()
        .withMessage("Nombre formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Nombre requerido")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Nombre de Establecimiento Educativo máximo 100 caracteres"),
    
    //validaciones de CUE
    body("cue")
        .trim()
        .isLength({ min: 7, max: 7 })
        .isString()
        .withMessage("El CUE debe tener 7 caracteres")
        .custom(async (value) => {
            const existingEstablecimiento = await EstablecimientoEducativo.findOne({ cue: value });
            if (existingEstablecimiento) {
                throw new Error("Ya existe un establecimiento con este CUE");
            }
        }),

    //validaciones para Provincia
    // -- NO necesario actualmente, siempre es "Córdoba" --

    //validaciones de Departamento
    body("departamento")
        .trim()
        .notEmpty()
        .withMessage("El departamento es requerido")
        .custom(async (value) => {
            const departamentos = await getDepartamentosForValidation();
            const departamentoIngresado = value.toUpperCase();
            if (!departamentos.has(departamentoIngresado)) {
                throw new Error("El departamento seleccionado no es válido");
            }
        }),
    
    //validaciones de localidad
    body("localidad")
        .trim()
        .notEmpty()
        .withMessage("La localidad es requerida")
        .isString()
        .withMessage("Formato de localidad incorrecto")
        .isLength({ max: 50 })
        .withMessage("Localidad debe tener máximo 50 caracteres"),
    
    //validaciones de domicilio
    body("domicilio")
        .isString()
        .withMessage("Domicilio formato incorrecto")
        .trim()
        .notEmpty()
        .withMessage("Domicilio requerido")
        .trim()
        .isLength({ max: 80 })
        .withMessage("Domicilio máximo 80 caracteres"),
    
    //validaciones de CP
    body("CP")
        .optional()
        .trim()
        .isString()
        .withMessage("Formato de código postal incorrecto")
        .isLength({ min: 4, max: 10 })
        .withMessage("El código postal debe tener entre 4 y 10 caracteres"),
    

    //validaciones de telefono
    body("telefono")
        .optional()
        .trim()
        .isString()
        .withMessage("Formato de teléfono incorrecto")
        .isLength({ min: 7, max: 30 })
        .withMessage("El teléfono debe tener entre 7 y 30 caractéres"),

    //validaciones de email
    body("email")
        .optional()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Formato de email incorrecto"),

    //validaciones de niveles
    body("niveles.inicial")
        .notEmpty()
        .withMessage("El valor del nivel inicial es requerido")
        .isBoolean()
        .withMessage("El valor del nivel inicial debe ser un booleano"),

    body("niveles.primario")
        .notEmpty()
        .withMessage("El valor del nivel primario es requerido")
        .isBoolean()
        .withMessage("El valor del nivel primario debe ser un booleano"),

    body("niveles.secundario")
        .notEmpty()
        .withMessage("El valor del nivel secundario es requerido")
        .isBoolean()
        .withMessage("El valor del nivel secundario debe ser un booleano"),

    body("niveles.terciario")
        .notEmpty()
        .withMessage("El valor del nivel terciario es requerido")
        .isBoolean()
        .withMessage("El valor del nivel terciario debe ser un booleano"),

    

        validarCampos
    ]