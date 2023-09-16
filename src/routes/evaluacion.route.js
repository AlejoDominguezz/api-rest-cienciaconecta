import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { cancelarEvaluacion, confirmarEvaluacion, evaluarProyecto, getEstructuraEvaluacion, visualizarEvaluacion } from "../controllers/evaluaciones.controller.js";
import { evaluacionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerEvaluacion = Router();

routerEvaluacion.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, evaluacionValidator, evaluarProyecto);
routerEvaluacion.get("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, getEstructuraEvaluacion);
routerEvaluacion.get("/confirmar/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, confirmarEvaluacion);
routerEvaluacion.get('/consultar/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.comAsesora, roles.refEvaluador]), esEvaluadorDelProyecto, visualizarEvaluacion)
routerEvaluacion.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.comAsesora, roles.refEvaluador]), esEvaluadorDelProyecto, cancelarEvaluacion)

export default routerEvaluacion;
