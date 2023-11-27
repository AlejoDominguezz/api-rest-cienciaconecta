import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { checkRolAuth, esPropietario } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { obtenerDevoluciones } from "../controllers/devoluciones.controller.js";

const routerDevolucion = Router();

routerDevolucion.get(
    "/:id",
    requireToken,
    checkRolAuth([roles.responsableProyecto]),
    esPropietario,
    obtenerDevoluciones
)
  
export default routerDevolucion;