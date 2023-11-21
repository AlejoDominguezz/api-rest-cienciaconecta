import { Router } from 'express';
import { check } from 'express-validator';
import { requireToken } from '../middlewares/requireToken.js';
import { allRoles } from '../helpers/roles.js';
import { getNotificaciones, getNotificacionesNuevas, notificacionesLeidas } from '../controllers/notificaciones.controller.js';
import { checkRolAuth } from '../middlewares/validar-roles.js';
import { notificacionesLeidasValidator } from '../middlewares/validationManagerNotificaciones.js';


const routerNotificaciones = Router();

routerNotificaciones.get('/new', requireToken, checkRolAuth(allRoles), getNotificacionesNuevas)
routerNotificaciones.get('/', requireToken, checkRolAuth(allRoles), getNotificaciones)
routerNotificaciones.post('/',  requireToken, checkRolAuth(allRoles), notificacionesLeidasValidator, notificacionesLeidas)

export default routerNotificaciones;
