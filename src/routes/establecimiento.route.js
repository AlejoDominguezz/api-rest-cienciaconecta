import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { getEstablecimientosEducativos, getSedesActuales } from "../controllers/establecimientos.controller.js";

const routerEstablecimiento = Router();

routerEstablecimiento.get("/sedes", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedesActuales);
routerEstablecimiento.get("/:localidad", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientosEducativos);

export default routerEstablecimiento;