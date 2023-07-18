import { Router } from "express";
import { deleteUser , getUsers , updateUser} from "../controllers/usuarios.controller.js";
import { bodyRegisterValidator  , bodyDeleteValidator , bodyUpdateValidator} from "../middlewares/validationManager.js";
import { requireToken } from "../middlewares/requireToken.js";
import { roles } from "../helpers/roles.js";
import { checkRolAuth } from "../middlewares/validar-roles.js";

const routerUsuarios = Router();


//eliminar un usuario
routerUsuarios.delete("/:id", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyDeleteValidator, deleteUser);

//obtener todos los usuarios 
routerUsuarios.get("/" , requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getUsers);

//actualizar un usuario
routerUsuarios.patch("/:id" ,requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyUpdateValidator , updateUser);


export default routerUsuarios;
