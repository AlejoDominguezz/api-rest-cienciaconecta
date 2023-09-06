import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import axios from "axios";
import { existsId, existeCuil, existeProyecto, existeCategoria, existeNivel } from "../helpers/db-validar.js";
import { check } from "express-validator";
import { checkEstablecimientoIsSede } from '../controllers/establecimientos.controller.js'
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";

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
  // body("dni", "DNI requerido").trim().notEmpty(),
  // body("dni", "Formato de DNI incorrecto").trim().isString().isLength({ min: 7, max: 8 }),

  //validaciones de CUE
  // body("cue", "El CUE es requerido y debe ser un string")
  //   .trim()
  //   .isString()
  //   .notEmpty(),

  // body("cue", "El CUE debe tener 7 caracteres")
  //   .trim()
  //   .isLength({ min: 7, max: 7 })
  //   .isString(),

  // Validacion de telefono
  body("telefono", "Formato de teléfono incorrecto")
    .trim()
    .isString()
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
    .isString()
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

  //validaciones de reseña
  body("descripcion", "Descripcion requerida").trim().notEmpty(),
  body("descripcion", "Descripción máximo 500 caracteres")
    .trim()
    .isLength({ max: 500 }),

  //validaciones de nivel
  body("nivel").trim().notEmpty().withMessage("Nivel requerido")
    .isMongoId().withMessage("ID de Nivel incorrecto"),
  check("nivel").custom(existeNivel),

  //validaciones de categoria
  body("categoria").trim().notEmpty().withMessage("Categoría requerida")
    .isMongoId().withMessage("ID de Categoria incorrecto"),
  check("categoria").custom(existeCategoria),

  //validaciones de establecimiento educativo
  body('establecimientoEducativo')
    .isMongoId()
    .withMessage('El ID del establecimiento no es válido')
    .custom(async (value) => {
      const establecimiento = await EstablecimientoEducativo.findById(value);
      if (!establecimiento) {
        throw new Error('El establecimiento no existe');
      }
    }),

  //validaciones de email escuela
  body("emailEscuela", "El email de contacto de la escuela es requerido")
    .trim()
    .notEmpty(),
  body("emailEscuela", "Email con formato incorrecto")
    .trim()
    .isEmail(),

  validarCampos,
];

export const bodyActualizarProyectoRegionalValidator = [
  
  body('sede')
    .isMongoId()
    .withMessage('El ID de la sede no es válido')
    .custom(async (value) => {
      try {
        const isSedeValid = await checkEstablecimientoIsSede(value);
  
        if (!isSedeValid) {
          throw new Error('El establecimiento elegido no es una sede actual');
        }
      } catch (error) {
        console.error('Error al obtener la sede actual:', error);
        throw new Error('El establecimiento elegido no es una sede actual');
      }
    }),

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
    .trim()
    .notEmpty()
    .isLength({ min: 7, max: 8 })
    .withMessage(
      "El DNI del miembro del grupo debe ser un número de entre 7 y 8 digitos"
    )
    // Validación de DNIs no repetidos
    .custom((dni, { req }) => {
      const grupoProyecto = req.body.grupoProyecto;
      const dniSet = new Set();

      for (const miembro of grupoProyecto) {
        if (dniSet.has(miembro.dni)) {
          throw new Error("El DNI del miembro del grupo está repetido");
        } else {
          dniSet.add(miembro.dni);
        }
      }

      return true;
    }),
  
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
  body("nombre", "Nombre máximo 30 caracteres")
      .optional()
      .trim()
      .isLength({ max: 30 }),
  body("apellido", "Apellido máximo 30 caracteres")
    .optional()
    .trim()
    .isLength({ max: 30 }),
  // body("cuil")
  //   .optional()
  //   .trim()
  //   .isLength({ min: 10, max: 11 })
  //   .withMessage("Formato de CUIL incorrecto"),
  // body("dni", "Formato de DNI incorrecto").optional().trim().isLength({ min: 7, max: 8 }),
  // body("cue", "El CUE debe tener 7 caracteres numéricos")
  //   .trim()
  //   .isLength({ min: 7, max: 7 })
  //   .isString(),
  body("telefono", "Formato de teléfono incorrecto")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 7, max: 15 }),
  body("cargo", "El cargo no puede tener más de 30 caracteres")
    .optional()
    .trim()
    .isLength({ max: 30 }),

  body("email", "Formato de email incorrecto")
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail(),

  body("password", "Mínimo 8 caracteres y máximo 20")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 }),

  body("password", "La contraseña debe tener al menos un número")
  .optional()
  .matches(
    /[0-9]/
  ),

  body("password", "La contraseña debe tener al menos una mayúscula")
  .optional()
  .matches(
    /[A-Z]/
  ),
  validarCampos,
];
