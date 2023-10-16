/**
 * @swagger
 * tags:
 *   name: Promocion de Proyectos
 *   description: Operaciones relacionadas con la promoción de proyectos a la siguiente instancia de Feria
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { obtenerProyectosNacional, obtenerProyectosProvincial, promoverProyectos_Nacional, promoverProyectos_Provincial } from "../controllers/promociones.controller.js";
import { obtenerNacionalValidator, obtenerProvincialValidator, promoverNacionalValidator, promoverProvincialValidator } from "../middlewares/validationManagerPromocion.js";

const routerPromocion = Router();

routerPromocion.post("/provincial/proyectos", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerProvincialValidator, obtenerProyectosProvincial);
routerPromocion.post("/nacional/proyectos", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerNacionalValidator, obtenerProyectosNacional);
//routerPromocion.post("/regional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverProyectosPorNivel_Regional);
routerPromocion.post("/provincial", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverProvincialValidator, promoverProyectos_Provincial);
routerPromocion.post("/nacional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverNacionalValidator, promoverProyectos_Nacional);

export default routerPromocion;


// DOCUMENTACION SWAGGER -------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/promocion/provincial/proyectos:
 *   post:
 *     summary: "Obtiene proyectos regionales para promoción a instancia provincial"
 *     tags: 
 *       - "Promocion de Proyectos"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nivel:
 *                 type: string
 *                 description: "ID del nivel del proyecto a buscar."
 *               sede:
 *                 type: string
 *                 description: "ID de la sede del proyecto a buscar."
 *     responses:
 *       200:
 *         description: "Éxito. Devuelve una lista de proyectos regionales ordenados y filtrados para promoción a instancia provincial."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyectos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Propiedades de cada proyecto devuelto
 *       204:
 *         description: "No Content. No se encontraron proyectos que cumplan los criterios para ser promovidos."
 */


/**
 * @swagger
 * /api/v1/promocion/nacional/proyectos:
 *   post:
 *     summary: "Obtiene proyectos provinciales para promoción a instancia nacional"
 *     tags: 
 *       - "Promocion de Proyectos"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nivel:
 *                 type: string
 *                 description: "ID del nivel del proyecto a buscar."
 *     responses:
 *       200:
 *         description: "Éxito. Devuelve una lista de proyectos provinciales ordenados y filtrados para promoción a instancia nacional."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyectos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       # Propiedades de cada proyecto devuelto
 *       204:
 *         description: "No Content. No se encontraron proyectos que cumplan los criterios para ser promovidos."
 */



/**
 * @swagger
 * /api/v1/promocion/provincial:
 *   post:
 *     summary: "Promueve proyectos a la instancia Provincial"
 *     tags: 
 *       - "Promocion de Proyectos"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proyectos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "IDs de los proyectos a promover a la instancia provincial."
 *               nivel:
 *                 type: string
 *                 description: "ID del nivel de los proyectos a promover."
 *               sede:
 *                 type: string
 *                 description: "ID de la sede de los proyectos a promover."
 *     responses:
 *       200:
 *         description: "Éxito. Los proyectos han sido agregados a la lista de promoción a instancia provinial."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       401:
 *         description: "No es posible promover los proyectos debido a restricciones de cupo en esta instancia provincial."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: "No es posible promover los proyectos debido a que el cuerpo de la solicitud no pasó las validaciones."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *       500:
 *         description: "Error de servidor. No se pudieron promover los proyectos."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */




/**
 * @swagger
 * /api/v1/promocion/nacional:
 *   post:
 *     summary: "Promueve proyectos a la instancia Nacional"
 *     tags: 
 *       - "Promocion de Proyectos"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proyectos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "IDs de los proyectos a promover a la instancia nacional."
 *               nivel:
 *                 type: string
 *                 description: "ID del nivel de los proyectos a promover."
 *     responses:
 *       200:
 *         description: "Éxito. Los proyectos han sido agregados a la lista de promoción a instancia nacional."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       401:
 *         description: "No es posible promover los proyectos debido a restricciones de cupo en esta instancia nacional."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: "No es posible promover los proyectos debido a que el cuerpo de la solicitud no pasó las validaciones."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *       500:
 *         description: "Error de servidor. No se pudieron promover los proyectos."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */