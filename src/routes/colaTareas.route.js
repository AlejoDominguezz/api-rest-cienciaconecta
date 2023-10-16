/**
 * @swagger
 * tags:
 *   name: Cola de Tareas
 *   description: Operaciones relacionadas con la consulta de información de las colas de tareas
 */

import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { obtenerEstadoCargaArchivos } from '../controllers/colaTareas.controller.js';

const routerCola = Router();

//obtener todas las categorias 
routerCola.get('/estado/:idProyecto',  requireToken, checkRolAuth([roles.admin, roles.comAsesora, roles.docente, roles.responsableProyecto, roles.evaluador, roles.refEvaluador]), obtenerEstadoCargaArchivos)

export default routerCola;