import {Router} from 'express';
import { login, logout, register } from '../controllers/auth.js';
import { bodyLoginValidator, bodyRegisterValidator } from '../middlewares/validationManager.js';

const routerAuth = Router();

routerAuth.post('/login', bodyLoginValidator, login);
routerAuth.post('/register', bodyRegisterValidator, register);
routerAuth.get('/logout', logout);

export default routerAuth;