import { Router } from 'express';
import { check } from 'express-validator';
import { getCategorias } from '../controllers/categorias.controller.js';

const routerCategorias = Router();

//obtener todas las ferias 
routerCategorias.get('/',  [] 
    , getCategorias)



export default routerCategorias;