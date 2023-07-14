import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { consultarProyecto, consultarProyectos, eliminarProyecto, inscribirProyectoEscolar, modificarProyecto } from "../controllers/proyectos.controller.js";
import { bodyInscribirProyectoValidator } from "../middlewares/validationManager.js";

const routerProyectos = Router();

routerProyectos.post("/", requireToken, bodyInscribirProyectoValidator, inscribirProyectoEscolar);
routerProyectos.get("/:id", requireToken, consultarProyecto);
routerProyectos.get("/", requireToken, consultarProyectos);
routerProyectos.patch("/:id", requireToken, bodyInscribirProyectoValidator, modificarProyecto);
//routerProyectos.patch("/:id", requireToken, actualizarProyectoRegional);
routerProyectos.delete("/:id", requireToken, eliminarProyecto);

export default routerProyectos;
