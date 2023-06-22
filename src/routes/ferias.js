const { Router } = require('express');
const { check } = require('express-validator');
const {getFerias} = require('../controllers/ferias');

const router = Router();

//obtener todas las ferias 
router.get('/',  [] 
    , getFerias)



module.exports = router;