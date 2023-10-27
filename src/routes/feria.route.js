/**
 * @swagger
 * tags:
 *   name: Ferias
 *   description: Operaciones relacionadas con la Feria. Sin validaciones de estados de Feria.
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { crearFeria, eliminarFeria, getFerias, modificarFeria, getFeriaActiva, obtenerInfoResumidaFeria } from '../controllers/ferias.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { bodyCrearFeriaValidator, bodyModificarFeriaValidator } from '../middlewares/validationManagerFeria.js';

const routerFerias = Router();

//obtener todas las ferias 
routerFerias.get('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getFerias)
routerFerias.get('/activa', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getFeriaActiva),
routerFerias.post('/', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyCrearFeriaValidator, crearFeria)
routerFerias.patch('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), bodyModificarFeriaValidator, modificarFeria)
routerFerias.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), eliminarFeria)
routerFerias.get('/info', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerInfoResumidaFeria)

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
