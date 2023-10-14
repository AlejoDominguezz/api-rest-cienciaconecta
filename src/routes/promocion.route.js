/**
 * @swagger
 * tags:
 *   name: Promocion de Proyectos
 *   description: Operaciones relacionadas con la promoción de proyectos a la siguiente instancia de Feria
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto, esReferenteDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { cancelarEvaluacion, confirmarEvaluacion, evaluarProyecto, iniciarEvaluacion, visualizarEvaluacion, obtenerEvaluacionesPendientes, obtenerEvaluacionPendienteById } from "../controllers/evaluaciones.controller.js";
import { evaluacionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerPromocion = Router();

routerPromocion.get("/nivel/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerProyectosPorNivel);
routerPromocion.post("/nivel/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverProyectosPorNivel);


export default routerPromocion;