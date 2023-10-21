/**
 * @swagger
 * tags:
 *   name: Exposicion Provincial
 *   description: Operaciones relacionadas con la evaluación de exposición de proyectos en la instancia provincial
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto  } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { cancelarEvaluacionExposicion, confirmarEvaluacionExposicion, evaluarExposicionProyecto, iniciarEvaluacionExposicion, visualizarEvaluacionExposicion } from "../controllers/exposiciones_provinciales.controller.js";
import { exposicionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerExposicion_Provincial = Router();

routerExposicion_Provincial.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, exposicionValidator, evaluarExposicionProyecto);
routerExposicion_Provincial.get("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, iniciarEvaluacionExposicion);
routerExposicion_Provincial.get("/confirmar/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, confirmarEvaluacionExposicion);
routerExposicion_Provincial.get('/consultar/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.comAsesora, roles.refEvaluador]), esEvaluadorDelProyecto, visualizarEvaluacionExposicion)
routerExposicion_Provincial.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, cancelarEvaluacionExposicion)

export default routerExposicion_Provincial;