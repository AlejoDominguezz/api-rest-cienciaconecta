import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { bajaProyecto, consultarProyecto, consultarProyectos, eliminarProyecto, inscribirProyectoEscolar, modificarProyectoEscolar, modificarProyectoRegional } from "../controllers/proyectos.controller.js";
import { bodyInscribirProyectoValidator, bodyActualizarProyectoRegionalValidator } from "../middlewares/validationManager.js";
import { checkRolAuth, esPropietario } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";

const routerProyectos = Router();

routerProyectos.post("/", requireToken, checkRolAuth([roles.admin, roles.docente]), bodyInscribirProyectoValidator, inscribirProyectoEscolar);
routerProyectos.get("/:id", requireToken, checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario, consultarProyecto);
routerProyectos.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), consultarProyectos);
routerProyectos.patch("/:id", requireToken, checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario, bodyInscribirProyectoValidator, modificarProyectoEscolar);
routerProyectos.patch("/regional/:id", requireToken, checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario, bodyInscribirProyectoValidator, bodyActualizarProyectoRegionalValidator, modificarProyectoRegional);
//routerProyectos.patch("/regional/update/:id", requireToken, checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario, bodyActualizarProyectoRegionalValidator, actualizarProyectoRegional);
routerProyectos.delete("/delete/:id", requireToken, checkRolAuth([roles.admin]), eliminarProyecto);
routerProyectos.delete("/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora, roles.responsableProyecto]), esPropietario, bajaProyecto);


export default routerProyectos;
