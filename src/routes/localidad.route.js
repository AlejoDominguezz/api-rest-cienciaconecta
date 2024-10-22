/**
 * @swagger
 * tags:
 *   name: Localidades
 *   description: Operaciones relacionadas con las localidades. Sin validaciones de estados de Feria.
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { allRoles, roles } from "../helpers/roles.js";
import { getLocalidades } from "../controllers/localidades.controller.js";

const routerLocalidades = Router();

routerLocalidades.get(
  "/:departamento",
  requireToken,
  checkRolAuth(allRoles),
  getLocalidades
);

export default routerLocalidades;

/**
 * @swagger
 * /api/v1/localidad/:departamento:
 *   get:
 *     summary: Obtener localidades por departamento
 *     tags: [Localidades]
 *     parameters:
 *       - name: departamento
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Departamento para filtrar localidades
 *     responses:
 *       '200':
 *         description: Lista de localidades en el departamento especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 localidades:
 *                   type: array
 *                   items:
 *                     type: string
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */
