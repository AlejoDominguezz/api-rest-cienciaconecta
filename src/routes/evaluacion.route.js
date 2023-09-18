/**
 * @swagger
 * tags:
 *   name: Evaluacion
 *   description: Operaciones relacionadas con la evaluación teórica de proyectos
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esEvaluadorDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { cancelarEvaluacion, confirmarEvaluacion, evaluarProyecto, iniciarEvaluacion, visualizarEvaluacion } from "../controllers/evaluaciones.controller.js";
import { evaluacionValidator } from "../middlewares/validationManagerEvaluacion.js";

const routerEvaluacion = Router();

routerEvaluacion.post("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, evaluacionValidator, evaluarProyecto);
routerEvaluacion.get("/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, iniciarEvaluacion);
routerEvaluacion.get("/confirmar/:id", requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, confirmarEvaluacion);
routerEvaluacion.get('/consultar/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador, roles.comAsesora, roles.refEvaluador]), esEvaluadorDelProyecto, visualizarEvaluacion)
routerEvaluacion.delete('/:id', requireToken, checkRolAuth([roles.admin, roles.evaluador]), esEvaluadorDelProyecto, cancelarEvaluacion)

export default routerEvaluacion;



// DOCUMENTACIÓN SWAGGER ------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/:id:
 *     post:
 *       summary: Evaluar un proyecto
 *       tags:
 *         - Evaluacion
 *       description: Evalúa un proyecto asignado por su ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             example:
 *               evaluacion:
 *                 - rubricaId: "6506341c82f8cdece23c6f82"
 *                   criterioId: "6506341c82f8cdece23c6f83"
 *                   opcionSeleccionada: "6506341c82f8cdece23c6f84"
 *                 - rubricaId: "6506341c82f8cdece23c6f82"
 *                   criterioId: "6506341c82f8cdece23c6f88"
 *                   opcionSeleccionada: "6506341c82f8cdece23c6f89"
 *               comentarios:
 *                 - rubricaId: "6506341c82f8cdece23c6f82"
 *                   comentario: "Comentario de ejemplo"
 *                 - rubricaId: "6506341c82f8cdece23c6f8d"
 *                   comentario: "Comentario de ejemplo 2"
 *             schema:
 *               type: object
 *               properties:
 *                 evaluacion:
 *                   type: array
 *                   description: Lista de evaluaciones asociadas al proyecto.
 *                 comentarios:
 *                   type: array
 *                   description: Lista de comentarios asociados al proyecto.
 *               required:
 *                 - evaluacion
 *       responses:
 *         '200':
 *           description: Evaluación realizada con éxito.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   ok:
 *                     type: boolean
 *                     description: Indica si la evaluación se realizó con éxito.
 *                   evaluacion:
 *                     $ref: '#/components/schemas/Evaluacion'
 *         '401':
 *           description: No se pudo realizar la evaluación debido a restricciones.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '404':
 *           description: No se encontró el proyecto o recursos relacionados.
 */


/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/:id:
 *     get:
 *       summary: Iniciar evaluación de un proyecto
 *       tags:
 *         - Evaluacion
 *       description: Inicia la evaluación de un proyecto asignado por su ID. Obtiene la estructura de rubricas de la feria y la estructura de evaluación teórica asociada al proyecto, ya sea que exista una evaluación previa o no.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       responses:
 *         '200':
 *           description: Inicio de evaluación exitoso. Devuelve la estructura de evaluación teórica.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID de la rubrica.
 *                     nombreRubrica:
 *                       type: string
 *                       description: Nombre de la rubrica.
 *                     comentario:
 *                       type: object
 *                       description: Comentario asociado a la rubrica (si existe).
 *                       properties:
 *                         rubricaId:
 *                           type: string
 *                           description: ID de la rubrica.
 *                         comentario:
 *                           type: string
 *                           description: Comentario de la rubrica.
 *                     criterios:
 *                       type: array
 *                       description: Lista de criterios de la rubrica.
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del criterio.
 *                           nombre:
 *                             type: string
 *                             description: Nombre del criterio.
 *                           seleccionada:
 *                             type: object
 *                             description: Opción seleccionada para el criterio (si existe).
 *                             properties:
 *                               rubricaId:
 *                                 type: string
 *                                 description: ID de la rubrica.
 *                               criterioId:
 *                                 type: string
 *                                 description: ID del criterio.
 *                               opcionSeleccionada:
 *                                 type: string
 *                                 description: ID de la opción seleccionada.
 *                           opciones:
 *                             type: array
 *                             description: Lista de opciones para el criterio.
 *                             items:
 *                               type: object
 *                               properties:
 *                                 nombre:
 *                                   type: string
 *                                   description: Nombre de la opción.
 *                                 _id:
 *                                   type: string
 *                                   description: ID de la opción.
 *         '401':
 *           description: No se pudo iniciar la evaluación debido a restricciones.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '404':
 *           description: No se encontró el proyecto o recursos relacionados.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '409':
 *           description: Error al comprobar si el usuario es evaluador del proyecto.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */


/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/confirmar/:id:
 *     get:
 *       summary: Confirmar evaluación de un proyecto
 *       tags:
 *         - Evaluacion
 *       description: Confirma la evaluación de un proyecto una vez que todos los evaluadores asignados han evaluado el proyecto. Solo los usuarios con roles de administrador o evaluador pueden confirmar la evaluación.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       responses:
 *         '200':
 *           description: Confirmación de evaluación exitosa.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   ok:
 *                     type: boolean
 *                     description: Indica si la confirmación fue exitosa.
 *                   responseMessage:
 *                     type: string
 *                     description: Mensaje de respuesta que indica el estado de la confirmación.
 *         '401':
 *           description: No se pudo confirmar la evaluación debido a restricciones.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '404':
 *           description: No se encontró el proyecto o recursos relacionados.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '409':
 *           description: Error al comprobar si el usuario es evaluador del proyecto.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */



/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/consultar/:id:
 *     get:
 *       summary: Consultar evaluación de un proyecto
 *       tags:
 *         - Evaluacion
 *       description: Consulta la evaluación de un proyecto y devuelve la estructura de rubricas y los datos de evaluación asociados, si existen. Solo los usuarios con roles de administrador, evaluador, comAsesora o refEvaluador pueden acceder a esta información.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto para el cual se desea consultar la evaluación.
 *       responses:
 *         '200':
 *           description: Consulta de evaluación exitosa.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID de la rubrica.
 *                     nombreRubrica:
 *                       type: string
 *                       description: Nombre de la rubrica.
 *                     comentario:
 *                       type: object
 *                       description: Comentario asociado a la rubrica (si existe).
 *                       properties:
 *                         rubricaId:
 *                           type: string
 *                           description: ID de la rubrica.
 *                         comentario:
 *                           type: string
 *                           description: Comentario de evaluación.
 *                         _id:
 *                           type: string
 *                           description: ID del comentario.
 *                     criterios:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del criterio.
 *                           nombre:
 *                             type: string
 *                             description: Nombre del criterio.
 *                           seleccionada:
 *                             type: object
 *                             description: Opción seleccionada para el criterio (si existe).
 *                             properties:
 *                               rubricaId:
 *                                 type: string
 *                                 description: ID de la rubrica.
 *                               criterioId:
 *                                 type: string
 *                                 description: ID del criterio.
 *                               opcionSeleccionada:
 *                                 type: string
 *                                 description: ID de la opción seleccionada.
 *                           opciones:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 nombre:
 *                                   type: string
 *                                   description: Nombre de la opción.
 *                                 _id:
 *                                   type: string
 *                                   description: ID de la opción.
 *         '401':
 *           description: No se pudo consultar la evaluación debido a restricciones.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '404':
 *           description: No se encontró el proyecto o recursos relacionados.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '409':
 *           description: Error al comprobar si el usuario es evaluador del proyecto.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */



/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/:id:
 *     delete:
 *       summary: Cancelar evaluación de un proyecto
 *       tags:
 *         - Evaluacion
 *       description: Permite al usuario evaluador cancelar la evaluación de un proyecto si está en curso. Sólo el evaluador que se encuentra evaluando el proyecto en este momento puede acceder a esta función.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto para el cual se desea cancelar la evaluación.
 *       responses:
 *         '200':
 *           description: Evaluación cancelada con éxito.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   ok:
 *                     type: boolean
 *                     description: Indica si la evaluación se canceló correctamente.
 *         '401':
 *           description: No se pudo cancelar la evaluación debido a restricciones.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '404':
 *           description: No se encontró el proyecto o recursos relacionados.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *         '500':
 *           description: Error de servidor al intentar cancelar la evaluación.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */
