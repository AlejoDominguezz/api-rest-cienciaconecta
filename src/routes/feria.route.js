/**
 * @swagger
 * tags:
 *   name: Ferias
 *   description: Operaciones relacionadas con la Feria. Sin validaciones de estados de Feria.
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { crearFeria, eliminarFeria, getFerias, modificarFeria, getFeriaActiva, obtenerInfoResumidaFeria, obtenerEstadoFeria , getFeriaById } from '../controllers/ferias.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { allRoles, roles } from "../helpers/roles.js";
import { bodyCrearFeriaValidator, bodyModificarFeriaValidator, queryFeriaId, validarIdFeria } from '../middlewares/validationManagerFeria.js';

const routerFerias = Router();

//obtener todas las ferias 
routerFerias.get('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getFerias)
routerFerias.get('/activa', requireToken, checkRolAuth(allRoles), getFeriaActiva),
routerFerias.post('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearFeriaValidator, crearFeria)
routerFerias.patch('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyModificarFeriaValidator, modificarFeria)
routerFerias.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), eliminarFeria)
routerFerias.get('/info', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), queryFeriaId, obtenerInfoResumidaFeria)
routerFerias.get('/estado', requireToken, checkRolAuth(allRoles), obtenerEstadoFeria)
routerFerias.get('/:id', requireToken, validarIdFeria ,  checkRolAuth(allRoles), getFeriaById);

export default routerFerias;

// DOCUMENTACIÓN SWAGGER -----------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/feria:
 *   get:
 *     summary: Obtener todas las ferias
 *     tags: [Ferias]
 *     parameters:
 *       - name: nombre
 *         in: query
 *         schema:
 *           type: string
 *         description: Nombre de la feria a buscar.
 *       - name: descripcion
 *         in: query
 *         schema:
 *           type: string
 *         description: Descripción de la feria a buscar.
 *       - name: logo
 *         in: query
 *         schema:
 *           type: string
 *         description: URL del logo de la feria.
 *       - name: fechaInicioFeria
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio de la feria (YYYY-MM-DD).
 *       - name: fechaFinFeria
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin de la feria (YYYY-MM-DD).
 *       - name: fechaInicioPostulacionEvaluadores
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio de la postulación de evaluadores (YYYY-MM-DD).
 *       - name: fechaFinPostulacionEvaluadores
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin de la postulación de evaluadores (YYYY-MM-DD).
 *       - name: fechaInicioAsignacionProyectos
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio de la asignación de proyectos (YYYY-MM-DD).
 *       - name: fechaFinAsignacionProyectos
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin de la asignación de proyectos (YYYY-MM-DD).
 *       - name: instancias
 *         in: query
 *         schema:
 *           type: string
 *         description: Instancias de la feria a buscar.
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *         description: Estado de la feria a buscar.
 *       - name: usuarioResponsable
 *         in: query
 *         schema:
 *           type: string
 *         description: ID del usuario responsable de la feria a buscar.
 *     responses:
 *       '200':
 *         description: Ferias encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ferias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feria'
 *       '204':
 *         description: No se han encontrado ferias.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */


/**
 * @swagger
 * /api/v1/feria/activa:
 *   get:
 *     summary: Obtener la feria activa actual
 *     tags: [Ferias]
 *     responses:
 *       '200':
 *         description: Feria activa encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feria'
 *       '401':
 *         description: No existe una feria activa en este momento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */


/**
 * @swagger
 * /api/v1/feria:
 *   post:
 *     summary: Crear una feria. Sólo es posible crear una Feria si no existe una Feria Activa en este momento.
 *     tags: [Ferias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la feria.
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la feria.
 *               logo:
 *                 type: string
 *                 description: URL del logo de la feria.
 *               fechaInicioFeria:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la feria (formato YYYY-MM-DD).
 *               fechaFinFeria:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la feria (formato YYYY-MM-DD).
 *               instancias:
 *                 type: object
 *                 properties:
 *                   instanciaRegional:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la instancia regional.
 *                       sedes:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Lista de sedes de la instancia regional.
 *                   instanciaProvincial:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la instancia provincial.
 *                       sede:
 *                         type: string
 *                         description: Sede de la instancia provincial.
 *               fechaInicioPostulacionEvaluadores:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la postulación de evaluadores (formato YYYY-MM-DD).
 *               fechaFinPostulacionEvaluadores:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la postulación de evaluadores (formato YYYY-MM-DD).
 *               fechaInicioAsignacionProyectos:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la asignación de proyectos (formato YYYY-MM-DD).
 *               fechaFinAsignacionProyectos:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la asignación de proyectos (formato YYYY-MM-DD).
 *               criteriosEvaluacion:
 *                 type: string
 *                 description: Criterios de evaluación de la feria.
 *     responses:
 *       '200':
 *         description: Feria creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       '400':
 *         description: Ya existe una feria con el nombre ingresado o existe una feria activa en este momento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '401':
 *         description: No existe el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */


/**
 * @swagger
 * /api/v1/feria/:id:
 *   patch:
 *     summary: Modificar una feria
 *     tags: [Ferias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la feria a modificar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la feria.
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la feria.
 *               logo:
 *                 type: string
 *                 description: URL del logo de la feria.
 *               fechaInicioFeria:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la feria (formato YYYY-MM-DD).
 *               fechaFinFeria:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la feria (formato YYYY-MM-DD).
 *               instancias:
 *                 type: object
 *                 properties:
 *                   instanciaEscolar:
 *                     type: object
 *                     properties:
 *                       fechaInicioInstancia:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio de la instancia escolar (formato YYYY-MM-DD).
 *                       fechaFinInstancia:
 *                         type: string
 *                         format: date
 *                         description: Fecha de fin de la instancia escolar (formato YYYY-MM-DD).
 *                   instanciaRegional:
 *                     type: object
 *                     properties:
 *                       fechaInicioEvaluacionTeorica:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio de la evaluación teórica de la instancia regional (formato YYYY-MM-DD).
 *                       fechaFinEvaluacionTeorica:
 *                         type: string
 *                         format: date
 *                         description: Fecha de fin de la evaluación teórica de la instancia regional (formato YYYY-MM-DD).
 *                       fechaInicioEvaluacionPresencial:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio de la evaluación presencial de la instancia regional (formato YYYY-MM-DD).
 *                       fechaFinEvaluacionPresencial:
 *                         type: string
 *                         format: date
 *                         description: Fecha de fin de la evaluación presencial de la instancia regional (formato YYYY-MM-DD).
 *                       cupos:
 *                         type: number
 *                         description: Cupos disponibles en la instancia regional.
 *                       sedes:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Lista de sedes de la instancia regional.
 *                   instanciaProvincial:
 *                     type: object
 *                     properties:
 *                       fechaInicioEvaluacionPresencial:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio de la evaluación presencial de la instancia provincial (formato YYYY-MM-DD).
 *                       fechaFinEvaluacionPresencial:
 *                         type: string
 *                         format: date
 *                         description: Fecha de fin de la evaluación presencial de la instancia provincial (formato YYYY-MM-DD).
 *                       cupos:
 *                         type: number
 *                         description: Cupos disponibles en la instancia provincial.
 *                       sede:
 *                         type: string
 *                         description: Sede de la instancia provincial.
 *               fechaInicioPostulacionEvaluadores:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la postulación de evaluadores (formato YYYY-MM-DD).
 *               fechaFinPostulacionEvaluadores:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la postulación de evaluadores (formato YYYY-MM-DD).
 *               fechaInicioAsignacionProyectos:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la asignación de proyectos (formato YYYY-MM-DD).
 *               fechaFinAsignacionProyectos:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la asignación de proyectos (formato YYYY-MM-DD).
 *               criteriosEvaluacion:
 *                 type: string
 *                 description: Criterios de evaluación de la feria.
 *     responses:
 *       '200':
 *         description: Feria modificada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feria:
 *                   type: object
 *       '400':
 *         description: Error al modificar la feria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '404':
 *         description: No existe la feria con el ID proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */


/**
 * @swagger
 * /api/v1/feria/:id:
 *   delete:
 *     summary: Dar de baja una feria. Sólo es posible eliminar una Feria si se encuentra en estado Creada.
 *     tags: [Ferias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la feria a dar de baja.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: La feria fue dada de baja exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       '400':
 *         description: La feria ya ha comenzado y no se puede dar de baja.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '404':
 *         description: No existe la feria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */




/**
 * @swagger
 * /api/v1/feria/info:
 *   get:
 *     summary: Obtener información resumida de la feria.
 *     tags: [Ferias]
 *     description: Devuelve información resumida de la feria activa, incluidas las sedes y detalles específicos de la instancia y próximas fechas importantes.
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 *     responses:
 *       '200':
 *         description: Información resumida de la feria encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feria:
 *                   type: object
 *                   properties:
 *                     sedes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID de la sede.
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la sede.
 *                           cantidadProyectosPresentados:
 *                             type: number
 *                             description: Número de proyectos presentados en la sede.
 *                           cantidadEvaluadores:
 *                             type: number
 *                             description: Número de evaluadores en la sede.
 *                           cantidadProyectosEvaluados:
 *                             type: number
 *                             description: Número de proyectos evaluados en la sede.
 *                     instancia_actual:
 *                       type: string
 *                       description: Fase actual de la feria.
 *                     prox_fecha:
 *                       type: string
 *                       description: Fecha próxima importante de la feria.
 *                     prox_instancia:
 *                       type: string
 *                       description: Próxima instancia de la feria.
 *                     total_proyectosPresentados:
 *                       type: number
 *                       description: Número total de proyectos presentados en la feria.
 *                     total_evaluadores:
 *                       type: number
 *                       description: Número total de evaluadores en la feria.
 *                     total_proyectosEvaluados:
 *                       type: number
 *                       description: Número total de proyectos evaluados en la feria.
 *       '204':
 *         description: No se ha encontrado información de la feria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */