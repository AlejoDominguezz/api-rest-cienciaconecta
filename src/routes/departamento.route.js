/**
 * @swagger
 * tags:
 *   name: Departamentos
 *   description: Operaciones relacionadas con los departamentos. Sin validaciones de estados de Feria.
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { allRoles, roles } from "../helpers/roles.js";
import { getDepartamentos } from "../controllers/departamentos.controller.js";

const routerDepartamentos = Router();

routerDepartamentos.get(
  "/",
  requireToken,
  checkRolAuth(allRoles),
  getDepartamentos
);

export default routerDepartamentos;

/**
 * @swagger
 * /api/v1/departamento:
 *   get:
 *     summary: Obtener todos los departamentos
 *     tags: [Departamentos]
 *     responses:
 *       '200':
 *         description: Lista de todos los departamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departamentos:
 *                   type: array
 *                   items:
 *                     type: string
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */
