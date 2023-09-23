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
import { obtenerListadoDocentes, seleccionarReferentes } from "../controllers/referentes.controller.js";
import { seleccionarReferentesValidator } from "../middlewares/validationManagerReferente.js";


const routerReferente = Router();

routerReferente.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), seleccionarReferentesValidator, seleccionarReferentes);
routerReferente.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerListadoDocentes);


export default routerReferente;