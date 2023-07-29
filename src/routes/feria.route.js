import { Router } from 'express';
import { check } from 'express-validator';
import { crearFeria, getFerias } from '../controllers/ferias.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";

const routerFerias = Router();

//obtener todas las ferias 
routerFerias.get('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getFerias)
routerFerias.post('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), crearFeria)



export default routerFerias;