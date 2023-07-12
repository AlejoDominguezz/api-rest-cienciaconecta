import { Router } from "express";
import { createUser } from "../controllers/usuarios.controller.js";
import { bodyRegisterValidator } from "../middlewares/validationManager.js";

const routerUsuarios = Router();

routerUsuarios.post("/register", bodyRegisterValidator, createUser);

export default routerUsuarios;
