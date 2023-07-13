import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import axios from "axios";

export const bodyRegisterValidator = [
  //validaciones de email correcto formato
  body("email", "Formato de email incorrecto")
    .trim()
    .isEmail()
    .normalizeEmail(),

  body("password", "Mínimo 8 caracteres y máximo 20")
    .trim()
    .isLength({ min: 8, max: 20 }),

  body("password", "La contraseña debe tener al menos un número")
    .matches(/[0-9]/),

  body("password", "La contraseña debe tener al menos una mayúscula")
    .matches(/[A-Z]/),


  //validaciones de nombre
  body("nombre", "Nombre requerido")
    .trim()
    .notEmpty(),

  body("nombre", "Nombre máximo 30 caracteres")
    .trim()
    .isLength({ max: 30 }),

  //validaciones de apellido
  body("apellido", "Apellido requerido")
    .trim()
    .notEmpty(),

  body("apellido", "Apellido máximo 30 caracteres")
    .trim()
    .isLength({ max: 30 }),

  //validaciones de CUIL (suponiendo que FRONTEND quita los "-" limitantes)
  body("cuil", "El cuil es requerido").trim().notEmpty(),
  body("cuil", "Formato de Cuil incorrecto")
    .trim()
    .isLength({ min: 10, max: 11 }),
  //validaciones de DNI
  body("dni", "DNI requerido")
    .trim()
    .notEmpty(),
  body("dni", "Formato de DNI incorrecto")
    .trim()
    .isLength({ min: 7, max: 8 }),

  //validaciones de CUE
  body("cue","El CUE es requerido")
    .trim()
    .notEmpty(),

  body("cue","El CUE debe tener 7 caracteres numéricos")
    .trim()
    .isLength({min:7, max:7})
    .isInt(),

  // Validacion de telefono
  body("telefono","Formato de teléfono incorrecto")
    .trim()
    .isInt()
    .isLength({ min: 7, max: 15}),

  // Validacion de cargo
  body("cargo","El cargo no puede tener más de 30 caracteres")
    .trim()
    .isLength({  max: 30}),

  body("cargo","El cargo es requerido")
    .trim()
    .notEmpty(),

  validarCampos,
];

export const bodyLoginValidator = [
  body("email", "Formato de email incorrecto")
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("password", "Mínimo 8 caracteres y máximo 20")
    .trim()
    .isLength({ min: 8, max: 20 }),
  body("password", "La contraseña debe tener al menos un número")
    .matches(/[0-9]/),
  body("password", "La contraseña debe tener al menos una mayúscula")
    .matches(/[A-Z]/),

  validarCampos,
];


export const bodyInscribirProyectoValidator = [

  //validaciones de titulo
  body("titulo", "Nombre requerido")
    .trim()
    .notEmpty(),
  body("titulo", "Título máximo 40 caracteres")
    .trim()
    .isLength({ max: 40 }),

  //validaciones de reseña
  body("descripcion", "Descripcion requerida")
    .trim()
    .notEmpty(),
  body("descripcion", "Descripción máximo 500 caracteres")
    .trim()
    .isLength({ max: 500 }),

  //validaciones de nivel
  body("nivel", "Nivel requerido")
    .trim()
    .notEmpty(),
  body("nivel", "Nivel incorrecto")
    .isInt()
    .isIn([1, 2, 3, 4]),

  //validaciones de categoria
  body("categoria", "Categoría requerida")
    .trim()
    .notEmpty(),
  body("categoria", "Categoría incorrecta")
    .isInt()
    .isIn([1, 2, 3]),

  //validaciones de nombre escuela
  body("nombreEscuela", "Nombre escuela requerido")
    .trim()
    .notEmpty(),
  body("nombreEscuela", "Nombre escuela máximo 40 caracteres")
    .trim()
    .isLength({ max: 40 }),

  //validaciones de CUE
  body("cueEscuela","El CUE es requerido")
    .trim()
    .notEmpty(),

  body("cueEscuela","El CUE debe tener 7 caracteres")
    .trim()
    .isLength({min:7, max:7}),

  //validaciones de tipo escuela
  body("privada","El tipo de escuela es requerido")
    .trim()
    .notEmpty(),
  body("privada","El tipo de escuela debe ser boolean")
    .trim()
    .isBoolean(),


  //validaciones de email escuela
  body("emailEscuela","El email de contacto de la escuela es requerido")
    .trim()
    .notEmpty(),
  body("emailEscuela","Email con formato incorrecto")
    .trim()
    .isEmail(),

  validarCampos,
];


