/**
 * @swagger
 * tags:
 *   name: Exposicion
 *   description: Operaciones relacionadas con la evaluación de exposición de proyectos
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto, esReferenteDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { cancelarEvaluacionExposicion, confirmarEvaluacionExposicion, evaluarExposicionProyecto, iniciarEvaluacionExposicion, visualizarEvaluacionExposicion } from "../controllers/exposiciones.controller.js";
import { exposicionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerExposicion = Router();

routerExposicion.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, exposicionValidator, evaluarExposicionProyecto);
//routerExposicion.get('/pendientes', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.refEvaluador]), obtenerEvaluacionesPendientes)
//routerExposicion.get('/pendientes/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.refEvaluador]), obtenerEvaluacionPendienteById)
routerExposicion.get("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, iniciarEvaluacionExposicion);
routerExposicion.get("/confirmar/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, confirmarEvaluacionExposicion);
routerExposicion.get('/consultar/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.comAsesora, roles.refEvaluador]), esEvaluadorDelProyecto, esReferenteDelProyecto, visualizarEvaluacionExposicion)
routerExposicion.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, cancelarEvaluacionExposicion)

export default routerExposicion;