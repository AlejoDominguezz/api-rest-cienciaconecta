/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Operaciones relacionadas con la gestión del usuario. Sin validaciones de estados de Feria.
 */

import { Router } from "express";
import {
  deleteUser,
  getOwnUser,
  getUsers,
  updateUser,
} from "../controllers/usuarios.controller.js";
import {
  bodyRegisterValidator,
  bodyDeleteValidator,
  bodyUpdateValidator,
} from "../middlewares/validationManager.js";
import { requireToken } from "../middlewares/requireToken.js";
import { allRoles, roles } from "../helpers/roles.js";
import { checkRolAuth, esIDUsuarioLogueado } from "../middlewares/validar-roles.js";

const routerUsuarios = Router();

//eliminar un usuario
// routerUsuarios.delete(
//   "/:id",
//   requireToken,
//   checkRolAuth([
//     roles.admin,
//     roles.comAsesora,
//     roles.docente,
//     roles.refEvaluador,
//     roles.evaluador,
//     roles.responsableProyecto,
//   ]),
//   bodyDeleteValidator,
//   deleteUser
// );

//obtener todos los usuarios
routerUsuarios.get(
  "/all",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.comAsesora,
  ]),
  getUsers
);

routerUsuarios.get(
  "/",
  requireToken,
  checkRolAuth(allRoles),
  getOwnUser
);

//actualizar un usuario
routerUsuarios.patch(
  "/:id",
  requireToken,
  checkRolAuth(allRoles),
  esIDUsuarioLogueado,
  bodyUpdateValidator,
  updateUser
);

export default routerUsuarios;

 // DOCUMENTACIÓN SWAGGER ------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/usuario/all:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuario]
 *     responses:
 *       '200':
 *         description: Lista de todos los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/Usuario'
 *                       - $ref: '#/components/schemas/Docente'
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */



/**
 * @swagger
 * /api/v1/usuario:
 *   get:
 *     summary: Obtener información del propio usuario
 *     tags: [Usuario]
 *     responses:
 *       '200':
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Usuario'
 *                     - $ref: '#/components/schemas/Docente'
 *     security:
 *       - bearerAuth: []
 *       - roles: [allRoles]
 */

/**
 * @swagger
 * /api/v1/usuario/:id:
 *   patch:
 *     summary: Actualizar un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               cargo:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Usuario actualizado exitosamente
 *       '404':
 *         description: No se encuentra el usuario con el ID ingresado
 *     security:
 *       - bearerAuth: []
 *       - roles: [allRoles]
 */