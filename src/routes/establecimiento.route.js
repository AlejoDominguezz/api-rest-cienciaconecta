import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { crearEstablecimientoEducativo, getEstablecimientosEducativos, getSedesRegionalesActuales, getSedeProvincialActual, getEstablecimientoById } from "../controllers/establecimientos.controller.js";
import { bodyCrearEstablecimientoValidator } from "../middlewares/validationManagerEstablecimiento.js";

const routerEstablecimiento = Router();

routerEstablecimiento.get("/sedes/regional", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedesRegionalesActuales);
routerEstablecimiento.get("/sedes/provincial", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getSedeProvincialActual);
routerEstablecimiento.get("/id/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientoById);
routerEstablecimiento.get("/:localidad", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getEstablecimientosEducativos);


routerEstablecimiento.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearEstablecimientoValidator, crearEstablecimientoEducativo)

export default routerEstablecimiento;
