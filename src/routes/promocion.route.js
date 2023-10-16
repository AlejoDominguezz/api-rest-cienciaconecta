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
import { obtenerProvincialValidator, promoverNacionalValidator, promoverProvincialValidator } from "../middlewares/validationManagerPromocion.js";

const routerPromocion = Router();

routerPromocion.post("/provincial/proyectos", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerProvincialValidator, obtenerProyectosProvincial);
routerPromocion.post("/nacional/proyectos", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerProvincialValidator, obtenerProyectosNacional);
//routerPromocion.post("/regional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverProyectosPorNivel_Regional);
routerPromocion.post("/provincial", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverProvincialValidator, promoverProyectos_Provincial);
routerPromocion.post("/nacional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), promoverNacionalValidator, promoverProyectos_Nacional);

export default routerPromocion;