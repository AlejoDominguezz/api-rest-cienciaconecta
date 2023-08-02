import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { getDepartamentos } from "../controllers/departamentos.controller.js";

const routerDepartamentos = Router();

routerDepartamentos.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getDepartamentos);

export default routerDepartamentos;
