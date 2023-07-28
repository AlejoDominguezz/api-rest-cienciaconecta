import { Router } from 'express';
import { check } from 'express-validator';
import {getNiveles} from '../controllers/niveles.controller.js';


const routerNiveles = Router();

//obtener todas las ferias 
routerNiveles.get('/',  [] 
    , getNiveles)



export default routerNiveles;