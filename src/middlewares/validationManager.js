import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import axios from "axios";
import { existsId, existeCuil, existeProyecto } from "../helpers/db-validar.js";
import { check } from "express-validator";

export const bodyRegisterValidator = [
  //validaciones de email correcto formato
  body("email", "Formato de email incorrecto")
    .trim()
    .isEmail()
    .normalizeEmail(),

  body("password", "Mínimo 8 caracteres y máximo 20")
    .trim()
    .isLength({ min: 8, max: 20 }),

  body("password", "La contraseña debe tener al menos un número").matches(
    /[0-9]/
  ),

  body("password", "La contraseña debe tener al menos una mayúscula").matches(
    /[A-Z]/
  ),

  //validaciones de nombre
  body("nombre", "Nombre requerido").trim().notEmpty(),

  body("nombre", "Nombre máximo 30 caracteres").trim().isLength({ max: 30 }),

  //validaciones de apellido
  body("apellido", "Apellido requerido").trim().notEmpty(),

  body("apellido", "Apellido máximo 30 caracteres")
    .trim()
    .isLength({ max: 30 }),

  //validaciones de CUIL (suponiendo que FRONTEND quita los "-" limitantes)
  body("cuil")
    .trim()
    .notEmpty()
    .withMessage("El CUIL es requerido")
    .trim()
    .isLength({ min: 10, max: 11 })
    .withMessage("Formato de CUIL incorrecto"),

    check("cuil").custom(existeCuil),
    

  
  //validaciones de DNI
  body("dni", "DNI requerido").trim().notEmpty(),
  body("dni", "Formato de DNI incorrecto").trim().isLength({ min: 7, max: 8 }),

  //validaciones de CUE
  body("cue", "El CUE es requerido y debe ser un numero entero")
    .trim()
    .isInt()
    .notEmpty(),

  body("cue", "El CUE debe tener 7 caracteres numéricos")
    .trim()
    .isLength({ min: 7, max: 7 })
    .isInt(),

  // Validacion de telefono
  body("telefono", "Formato de teléfono incorrecto")
    .trim()
    .isInt()
    .isLength({ min: 7, max: 15 }),

  // Validacion de cargo
  body("cargo", "El cargo no puede tener más de 30 caracteres")
    .trim()
    .isLength({ max: 30 }),

  body("cargo", "El cargo es requerido").trim().notEmpty(),

  validarCampos,
];

export const bodyLoginValidator = [
  body("cuil")
    .trim()
    .notEmpty()
    .withMessage("El cuil es requerido")
    .trim()
    .isLength({ min: 10, max: 11 })
    .withMessage("El cuil debe tener entre 10 y 11 caracteres"),
  body("password", "Mínimo 8 caracteres y máximo 20")
    .trim()
    .isLength({ min: 8, max: 20 }),
  body("password", "La contraseña debe tener al menos un número").matches(
    /[0-9]/
  ),
  body("password", "La contraseña debe tener al menos una mayúscula").matches(
    /[A-Z]/
  ),

  validarCampos,
];

export const bodyInscribirProyectoValidator = [
  //validaciones de titulo
  body("titulo", "Nombre requerido").trim().notEmpty(),
  body("titulo", "Título máximo 40 caracteres").trim().isLength({ max: 40 }),
  check("titulo").custom(existeProyecto),

  //validaciones de reseña
  body("descripcion", "Descripcion requerida").trim().notEmpty(),
  body("descripcion", "Descripción máximo 500 caracteres")
    .trim()
    .isLength({ max: 500 }),

  //validaciones de nivel
  body("nivel", "Nivel requerido").trim().notEmpty(),
  body("nivel", "Nivel incorrecto").isInt().isIn([1, 2, 3, 4]),

  //validaciones de categoria
  body("categoria", "Categoría requerida").trim().notEmpty(),
  body("categoria", "Categoría incorrecta").isInt().isIn([1, 2, 3]),

  //validaciones de nombre escuela
  body("nombreEscuela", "Nombre escuela requerido").trim().notEmpty(),
  body("nombreEscuela", "Nombre escuela máximo 40 caracteres")
    .trim()
    .isLength({ max: 40 }),

  //validaciones de CUE
  body("cueEscuela", "El CUE es requerido").trim().notEmpty(),

  body("cueEscuela", "El CUE debe tener 7 caracteres")
    .trim()
    .isLength({ min: 7, max: 7 }),

  //validaciones de tipo escuela
  body("privada", "El tipo de escuela es requerido").trim().notEmpty(),
  body("privada", "El tipo de escuela debe ser boolean").trim().isBoolean(),

  //validaciones de email escuela
  body("emailEscuela", "El email de contacto de la escuela es requerido")
    .trim()
    .notEmpty(),
  body("emailEscuela", "Email con formato incorrecto").trim().isEmail(),

  validarCampos,
];

export const bodyActualizarProyectoRegionalValidator = [
  body("videoPresentacion")
    .trim()
    .notEmpty()
    .withMessage("El video de presentación es requerido")
    .isURL()
    .withMessage("Formato de URL incorrecto"),
  body("registroPedagogico")
    .trim()
    .notEmpty()
    .withMessage("El registro pedagógico es requerido")
    .isURL()
    .withMessage("Formato de URL incorrecto"),
  body("carpetaCampo")
    .trim()
    .notEmpty()
    .withMessage("La carpeta de campo es requerida")
    .isURL()
    .withMessage("Formato de URL incorrecto"),
  body("informeTrabajo")
    .trim()
    .notEmpty()
    .withMessage("El informe de trabajo es requerido")
    .isURL()
    .withMessage("Formato de URL incorrecto"),
  body("sede")
    .trim()
    .isString()
    .withMessage("El ID de sede se debe enviar como un tipo String")
    .isLength({ max: 24, min: 24 })
    .withMessage("El ID de sede debe tener 24 caracteres alfanuméricos"),
  body("autorizacionImagen")
    .isBoolean()
    .withMessage("Se debe indicar que se autoriza el uso y cesión de imagen"),
  body("grupoProyecto")
    .isArray({ min: 1 })
    .withMessage(
      "El grupo de proyecto debe ser un arreglo con al menos un elemento"
    ),
  body("grupoProyecto.*.nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del miembro del grupo es requerido"),
  body("grupoProyecto.*.apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido del miembro del grupo es requerido"),
  body("grupoProyecto.*.dni")
    .isInt()
    .isLength({ min: 7, max: 8 })
    .withMessage(
      "El DNI del miembro del grupo debe ser un número de entre 7 y 8 digitos"
    ),

  validarCampos,
];
export const bodyDeleteValidator = [
  check("id", "no es un ID valido de mongo").isMongoId(),
  check("id").custom(existsId),
  validarCampos,
];

export const bodyUpdateValidator = [
  check("id", "no es un ID valido de mongo").isMongoId(),
  check("id").custom(existsId),
  validarCampos,
];
