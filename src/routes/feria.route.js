import { Router } from 'express';
import { check } from 'express-validator';
import {getFerias} from '../controllers/ferias.controller.js';

const routerFerias = Router();

//obtener todas las ferias 
routerFerias.get('/',  [] 
    , getFerias)



export default routerFerias;