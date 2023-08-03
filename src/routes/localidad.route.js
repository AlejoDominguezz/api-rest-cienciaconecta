import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { getLocalidades } from "../controllers/localidades.controller.js";

const routerLocalidades = Router();

routerLocalidades.get("/:departamento", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getLocalidades);

export default routerLocalidades;
