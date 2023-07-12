import { Router } from "express";
import { check } from "express-validator";
import { crearUsuario } from "../controllers/usuarios.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { existeEmail } from "../helpers/db-validar.js";


const routerUsuarios = Router();

routerUsuarios.post(
    "/",
    [
      check("nombre", "El nombre es obligatorio").not().isEmpty(),
      check(
        "password",
        "El password es obligatorio y mas de 8 caracteres"
      ).isLength({ min: 8 }),
      check(
        "dni",
        "El dni es obligatorio, y debe tener formato de DNI , min 8 caracteres"
      ).isLength({ min: 8 }),
      check(
        "cuil",
        "El CUIL es obligatorio y debe tener formato de cuil , min 13 caracteres"
      ).isLength({ min: 13 }),
      check("email", "El correo no es válido").isEmail(),
      check("email").custom(existeEmail),
      validarCampos,
    ],
    crearUsuario
  );


export default routerUsuarios;
