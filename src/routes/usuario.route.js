import { Router } from "express";
import { deleteUser , getUsers , updateUser} from "../controllers/usuarios.controller.js";
import { bodyRegisterValidator  , bodyDeleteValidator , bodyUpdateValidator} from "../middlewares/validationManager.js";
import { requireToken } from "../middlewares/requireToken.js";

const routerUsuarios = Router();


//eliminar un usuario
routerUsuarios.delete("/:id", requireToken ,bodyDeleteValidator , deleteUser);

//obtener todos los usuarios 
routerUsuarios.get("/" ,requireToken , getUsers);

//actualizar un usuario
routerUsuarios.patch("/:id" ,requireToken,bodyUpdateValidator , updateUser);


export default routerUsuarios;
