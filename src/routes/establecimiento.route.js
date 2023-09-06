import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { crearEstablecimientoEducativo, getEstablecimientosEducativos, getSedesActuales } from "../controllers/establecimientos.controller.js";
import { bodyCrearEstablecimientoValidator } from "../middlewares/validationManagerEstablecimiento.js";

const routerEstablecimiento = Router();

routerEstablecimiento.get("/sedes", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedesActuales);
routerEstablecimiento.get("/:localidad", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientosEducativos);

routerEstablecimiento.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearEstablecimientoValidator, crearEstablecimientoEducativo)

export default routerEstablecimiento;
