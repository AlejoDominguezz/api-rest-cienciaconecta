import {Router} from 'express';
import { confirmarCuenta, login, logout, register } from '../controllers/auth.controller.js';
import { bodyLoginValidator, bodyRegisterValidator } from '../middlewares/validationManager.js';
import { requireToken } from '../middlewares/requireToken.js';
import { requireRefreshToken } from '../middlewares/requireRefreshToken.js';
import { refreshToken } from '../middlewares/refreshToken.js';
import { prueba } from '../middlewares/prueba.js';

const routerAuth = Router();

routerAuth.post('/login', bodyLoginValidator, login);
routerAuth.post('/register', bodyRegisterValidator, register);
routerAuth.get('/logout', logout);
routerAuth.get('/protected', requireToken, prueba); //cambiar prueba por api correspondiente de la ruta protegida
routerAuth.get('/refresh', requireRefreshToken, refreshToken);
routerAuth.get('/confirmar/:token', confirmarCuenta)

export default routerAuth;