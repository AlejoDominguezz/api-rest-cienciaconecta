const { Router } = require("express");
const { check } = require("express-validator");
const { crearUsuario } = require("../controllers/usuarios");
const { validarCampos } = require("../middlewares");
const {existeEmail} = require('../helpers')
const router = Router();

//registrar un usuario en el sistema
router.post(
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
    check("correo", "El correo no es válido").isEmail(),
    check("correo").custom(existeEmail),
    validarCampos,
  ],
  crearUsuario
);

module.exports = router;
