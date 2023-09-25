/**
 * @swagger
 * tags:
 *   name: Referente
 *   description: Operaciones relacionadas con los referentes de evaluacion
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { eliminarReferente, modificarReferente, obtenerListadoDocentes, obtenerReferentesSeleccionados, seleccionarReferentes } from "../controllers/referentes.controller.js";
import { modificarReferenteValidator, seleccionarReferentesValidator } from "../middlewares/validationManagerReferente.js";


const routerReferente = Router();

routerReferente.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), seleccionarReferentesValidator, seleccionarReferentes);
routerReferente.patch("/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), modificarReferenteValidator, modificarReferente);
routerReferente.delete("/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), eliminarReferente);
routerReferente.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerListadoDocentes);
routerReferente.get("/asignados", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerReferentesSeleccionados);



export default routerReferente;