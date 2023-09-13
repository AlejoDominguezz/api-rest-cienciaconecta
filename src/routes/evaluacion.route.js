import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { evaluarProyecto } from "../controllers/evaluaciones.controller.js";
import { evaluacionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerEvaluacion = Router();

routerEvaluacion.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, evaluacionValidator, evaluarProyecto);

export default routerEvaluacion;
