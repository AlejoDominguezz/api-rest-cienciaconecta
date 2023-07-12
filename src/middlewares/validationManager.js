import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import axios from "axios";

export const bodyRegisterValidator = [
  //validaciones de email correcto formato
  body("email", "Formato de email incorrecto")
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("password", "Mínimo 8 caracteres").trim().isLength({ min: 8, max: 20 }),
  // 1 mayúscula y 1 número
  //agregar validaciones de contraseña


  //validaciones de nombre
  body("nombre", "Nombre requerido").trim().notEmpty(),
  body("nombre", "Nombre máximo 30 caracteres").trim().isLength({ max: 30 }),

  //validaciones de apellido
  body("apellido", "Apellido requerido").trim().notEmpty(),
  body("apellido", "Apellido máximo 30 caracteres")
    .trim()
    .isLength({ max: 30 }),

  //validaciones de CUIL (suponiendo que FRONTEND quita los "-" limitantes)
  body("cuil", "El cuil es requerido").trim().notEmpty(),
  body("cuil", "Formato de Cuil incorrecto")
    .trim()
    .isLength({ min: 10, max: 11 }),
  //validaciones de DNI
  body("dni", "DNI requerido").trim().notEmpty(),
  body("dni", "Formato de DNI incorrecto").trim().isLength({ min: 7, max: 8 }),

  //validaciones de CUE
  body("cue","El CUE es requerido").trim().notEmpty(),
  validarCampos,
];

export const bodyLoginValidator = [
  body("email", "Formato de email incorrecto")
    .trim()
    .isEmail()
    .normalizeEmail(),
  body("password", "Mínimo 6 caracteres").trim().isLength({ min: 6 }),
  validarCampos,
];
