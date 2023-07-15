import { Router } from "express";
import { deleteUser, registerUser , getUsers } from "../controllers/usuarios.controller.js";
import { bodyRegisterValidator  , bodyDeleteValidator} from "../middlewares/validationManager.js";
import { requireToken } from "../middlewares/requireToken.js";

const routerUsuarios = Router();

//registrar un usuario 
routerUsuarios.post("/register", bodyRegisterValidator, registerUser);

//eliminar un usuario
routerUsuarios.delete("/:id", requireToken ,bodyDeleteValidator , deleteUser);

routerUsuarios.get("/" , getUsers);


export default routerUsuarios;
