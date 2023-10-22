import { Router } from "express";
import {
  deleteUser,
  getOwnUser,
  getUsers,
  updateUser,
} from "../controllers/usuarios.controller.js";
import {
  bodyRegisterValidator,
  bodyDeleteValidator,
  bodyUpdateValidator,
} from "../middlewares/validationManager.js";
import { requireToken } from "../middlewares/requireToken.js";
import { roles } from "../helpers/roles.js";
import { checkRolAuth, esIDUsuarioLogueado } from "../middlewares/validar-roles.js";

const routerUsuarios = Router();

//eliminar un usuario
// routerUsuarios.delete(
//   "/:id",
//   requireToken,
//   checkRolAuth([
//     roles.admin,
//     roles.comAsesora,
//     roles.docente,
//     roles.refEvaluador,
//     roles.evaluador,
//     roles.responsableProyecto,
//   ]),
//   bodyDeleteValidator,
//   deleteUser
// );

//obtener todos los usuarios
routerUsuarios.get(
  "/all",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.comAsesora,
  ]),
  getUsers
);

routerUsuarios.get(
  "/",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.comAsesora,
    roles.docente,
    roles.refEvaluador,
    roles.evaluador,
    roles.responsableProyecto,
  ]),
  getOwnUser
);

//actualizar un usuario
routerUsuarios.patch(
  "/:id",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.comAsesora,
    roles.docente,
    roles.refEvaluador,
    roles.evaluador,
    roles.responsableProyecto,
  ]),
  esIDUsuarioLogueado,
  bodyUpdateValidator,
  updateUser
);

export default routerUsuarios;
