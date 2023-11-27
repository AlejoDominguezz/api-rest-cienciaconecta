import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from '../middlewares/validar-roles.js';
import { roles } from '../helpers/roles.js';
import { cantidadEvaluadores, cantidadProyectosAprobados, cantidadProyectosDesaprobados, cantidadProyectosFeria, cantidadProyectosInscriptos, porcProyectosAprobados, porcProyectosInscriptos, puntajePromedio } from '../controllers/reportes.controller.js';
import { reporteFeria, reporteFiltroFeria, reporteFiltroFeriaPuntaje } from '../middlewares/validationManagerReporte.js';

const routerReportes = Router();

//obtener todas las ferias 
routerReportes.get('/puntajePromedio', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeria, puntajePromedio)
routerReportes.get('/cantidadProyectosInscriptos', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeria, cantidadProyectosInscriptos)
routerReportes.get('/porcProyectosInscriptos', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeria, porcProyectosInscriptos)
routerReportes.get('/cantidadProyectosFeria', requireToken, checkRolAuth([roles.comAsesora]), cantidadProyectosFeria)
routerReportes.get('/cantidadEvaluadores', requireToken, checkRolAuth([roles.comAsesora]), reporteFeria, cantidadEvaluadores)
routerReportes.get('/cantidadProyectosAprobados', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeriaPuntaje, cantidadProyectosAprobados)
routerReportes.get('/cantidadProyectosDesaprobados', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeriaPuntaje, cantidadProyectosDesaprobados)
routerReportes.get('/porcProyectosAprobados', requireToken, checkRolAuth([roles.comAsesora]), reporteFiltroFeriaPuntaje, porcProyectosAprobados)

export default routerReportes;