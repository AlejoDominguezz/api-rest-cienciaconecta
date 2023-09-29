/**
 * @swagger
 * tags:
 *   name: Departamentos
 *   description: Operaciones relacionadas con los departamentos
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { getDepartamentos } from "../controllers/departamentos.controller.js";

const routerDepartamentos = Router();

routerDepartamentos.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora, roles.docente, roles.responsableProyecto, roles.evaluador, roles.refEvaluador]), getDepartamentos);

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