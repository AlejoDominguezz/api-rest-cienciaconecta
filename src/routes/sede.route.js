import { Router } from "express";
import { crearSede } from "../controllers/sedes.controller.js";
import { requireToken } from "../middlewares/requireToken.js";
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";

const routerSedes = Router();

//routerSedes.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), crearSede);

export default routerSedes;