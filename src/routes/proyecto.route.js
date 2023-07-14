import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { actualizarProyectoRegional, bajaProyecto, consultarProyecto, consultarProyectos, eliminarProyecto, inscribirProyectoEscolar, modificarProyectoEscolar, modificarProyectoRegional } from "../controllers/proyectos.controller.js";
import { bodyInscribirProyectoValidator } from "../middlewares/validationManager.js";

const routerProyectos = Router();

routerProyectos.post("/", requireToken, bodyInscribirProyectoValidator, inscribirProyectoEscolar);
routerProyectos.get("/:id", requireToken, consultarProyecto);
routerProyectos.get("/", requireToken, consultarProyectos);
routerProyectos.patch("/:id", requireToken, bodyInscribirProyectoValidator, modificarProyectoEscolar);
routerProyectos.patch("/regional/:id", requireToken, bodyInscribirProyectoValidator, modificarProyectoRegional);
routerProyectos.patch("/regional/update/:id", requireToken, actualizarProyectoRegional);
routerProyectos.delete("/delete/:id", requireToken, eliminarProyecto);
routerProyectos.delete("/:id", requireToken, bajaProyecto);


export default routerProyectos;
