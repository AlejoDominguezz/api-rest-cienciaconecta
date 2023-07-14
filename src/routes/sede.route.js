import { Router } from "express";
import { crearSede } from "../controllers/sedes.controller.js";

const routerSedes = Router();

routerSedes.post("/", crearSede);

export default routerSedes;