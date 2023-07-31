import { Router } from 'express';
import { check } from 'express-validator';
import { crearFeria, eliminarFeria, getFerias, modificarFeria } from '../controllers/ferias.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { bodyCrearFeriaValidator } from '../middlewares/validationManagerFeria.js';

const routerFerias = Router();

//obtener todas las ferias 
routerFerias.get('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getFerias)
routerFerias.post('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearFeriaValidator, crearFeria)
routerFerias.patch('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearFeriaValidator, modificarFeria)
routerFerias.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), eliminarFeria)




export default routerFerias;