const { Router } = require('express');
const { check } = require('express-validator');
const {crearUsuario} = require('../controllers/usuarios')

const router = Router();

//registrar un usuario en el sistema
router.post('/',  [] 
    , crearUsuario)



module.exports = router;