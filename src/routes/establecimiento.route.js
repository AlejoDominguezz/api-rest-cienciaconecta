/**
 * @swagger
 * tags:
 *   name: Establecimientos Educativos
 *   description: Operaciones relacionadas con los establecimientos educativos
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { crearEstablecimientoEducativo, getEstablecimientosEducativos, getSedesRegionalesActuales, getSedeProvincialActual, getEstablecimientoById } from "../controllers/establecimientos.controller.js";
import { bodyCrearEstablecimientoValidator } from "../middlewares/validationManagerEstablecimiento.js";

const routerEstablecimiento = Router();

routerEstablecimiento.get("/sedes/regional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedesRegionalesActuales);
routerEstablecimiento.get("/sedes/provincial", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedeProvincialActual);
routerEstablecimiento.get("/id/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientoById);
routerEstablecimiento.get("/:localidad", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientosEducativos);

routerEstablecimiento.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearEstablecimientoValidator, crearEstablecimientoEducativo)

export default routerEstablecimiento;

/**
 * @swagger
 * /api/v1/establecimiento/:localidad:
 *   get:
 *     summary: Obtener establecimientos educativos por localidad
 *     tags: [Establecimientos Educativos]
 *     parameters:
 *       - name: localidad
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Localidad para filtrar establecimientos educativos
 *     responses:
 *       '200':
 *         description: Lista de establecimientos educativos en la localidad especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 establecimientos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EstablecimientoEducativo'
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */

/**
 * @swagger
 * /api/v1/establecimiento/sedes/regional:
 *   get:
 *     summary: Obtener sedes regionales actuales
 *     tags: [Establecimientos Educativos]
 *     responses:
 *       '200':
 *         description: Lista de sedes regionales actuales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sedes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EstablecimientoEducativo'
 *       '404':
 *         description: No existe una feria activa en este momento
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */

/**
 * @swagger
 * /api/v1/establecimiento/sedes/provincial:
 *   get:
 *     summary: Obtener sede provincial actual
 *     tags: [Establecimientos Educativos]
 *     responses:
 *       '200':
 *         description: Sede provincial actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstablecimientoEducativo'
 *       '404':
 *         description: No existe una feria activa en este momento
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */

/**
 * @swagger
 * /api/v1/establecimiento/id/:id:
 *   get:
 *     summary: Obtener establecimiento educativo por ID
 *     tags: [Establecimientos Educativos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del establecimiento educativo
 *     responses:
 *       '200':
 *         description: Establecimiento educativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstablecimientoEducativo'
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */

/**
 * @swagger
 * /api/v1/establecimiento:
 *   post:
 *     summary: Crear un establecimiento educativo
 *     tags: [Establecimientos Educativos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del establecimiento educativo.
 *               cue:
 *                 type: string
 *                 description: Código Único de Establecimiento (CUE) del establecimiento.
 *               departamento:
 *                 type: string
 *                 description: Departamento del establecimiento.
 *               localidad:
 *                 type: string
 *                 description: Localidad del establecimiento.
 *               domicilio:
 *                 type: string
 *                 description: Domicilio del establecimiento.
 *               CP:
 *                 type: string
 *                 description: Código Postal del establecimiento.
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto del establecimiento.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de contacto del establecimiento.
 *               niveles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Niveles educativos ofrecidos por el establecimiento.
 *     responses:
 *       '200':
 *         description: Establecimiento educativo creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 establecimiento:
 *                   type: object
 *       '500':
 *         description: Error de servidor al crear el establecimiento educativo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */
