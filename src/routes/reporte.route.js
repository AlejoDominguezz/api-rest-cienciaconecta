import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from '../middlewares/validar-roles.js';
import { roles } from '../helpers/roles.js';
import { puntajePromedio } from '../controllers/reportes.controller.js';
import { reportePuntajePromedio } from '../middlewares/validationManagerReporte.js';

const routerReportes = Router();

//obtener todas las ferias 
routerReportes.get('/puntajePromedio', requireToken, checkRolAuth([roles.comAsesora]), reportePuntajePromedio, puntajePromedio)

export default routerReportes;