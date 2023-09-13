import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { bodyCrearEstablecimientoValidator } from "../middlewares/validationManagerEstablecimiento.js";
import { evaluarProyecto } from "../controllers/evaluaciones.controller.js";

const routerEvaluacion = Router();

routerEvaluacion.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, evaluarProyecto);


export default routerEvaluacion;
