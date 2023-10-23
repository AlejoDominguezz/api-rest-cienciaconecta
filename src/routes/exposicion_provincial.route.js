/**
 * @swagger
 * tags:
 *   name: Exposicion Provincial
 *   description: Operaciones relacionadas con la evaluación de exposición de proyectos en la instancia provincial
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import {
  checkRolAuth,
  esEvaluadorDelProyecto,
} from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import {
  cancelarEvaluacionExposicion,
  confirmarEvaluacionExposicion,
  evaluarExposicionProyecto,
  iniciarEvaluacionExposicion,
  visualizarEvaluacionExposicion,
} from "../controllers/exposiciones_provinciales.controller.js";
import { exposicionValidator } from "../middlewares/validationManagerEvaluacion.js";
import { estado } from "../middlewares/validar-fechas.js";
import { estadoFeria } from "../models/Feria.js";

const routerExposicion_Provincial = Router();

routerExposicion_Provincial.post(
  "/:id",
  estado([estadoFeria.instanciaProvincial_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  exposicionValidator,
  evaluarExposicionProyecto
);
routerExposicion_Provincial.get(
  "/:id",
  estado([estadoFeria.instanciaProvincial_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  iniciarEvaluacionExposicion
);
routerExposicion_Provincial.get(
  "/confirmar/:id",
  estado([estadoFeria.instanciaProvincial_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  confirmarEvaluacionExposicion
);
routerExposicion_Provincial.get(
  "/consultar/:id",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.evaluador,
    roles.comAsesora,
    roles.refEvaluador,
  ]),
  esEvaluadorDelProyecto,
  visualizarEvaluacionExposicion
);
routerExposicion_Provincial.delete(
  "/:id",
  estado([estadoFeria.instanciaProvincial_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  cancelarEvaluacionExposicion
);

export default routerExposicion_Provincial;

// DOCUMENTACIÓN SWAGGER ------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * paths:
 *   /api/v1/exposicion-provincial/:id:
 *     post:
 *       summary: Realizar evaluación de exposición provincial de un proyecto
 *       tags:
 *         - Exposicion Provincial
 *       description: |
 *            Estados: 
 *              - Instancia Provincial - En Exposicion (9)
 *       
 *            Evalúa la exposición provincial un proyecto asignado por su ID.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             example:
 *               evaluacion:
 *                 - rubricaId: "6506341c82f8cdece23c6f98"
 *                   criterioId: "6506341c82f8cdece23c6f99"
 *                   opcionSeleccionada: "6506341c82f8cdece23c6f9a"
 *                 - rubricaId: "6506341c82f8cdece23c6f98"
 *                   criterioId: "6506341c82f8cdece23c6f9e"
 *                   opcionSeleccionada: "6506341c82f8cdece23c6fa2"
 *                 - rubricaId: "6506341c82f8cdece23c6fa3"
 *                   criterioId: "6506341c82f8cdece23c6fa4"
 *                   opcionSeleccionada: "6506341c82f8cdece23c6fa6"
 *               comentarios:
 *                 - rubricaId: "6506341c82f8cdece23c6f98"
 *                   comentario: "Comentario de ejemplo"
 *                 - rubricaId: "6506341c82f8cdece23c6fa3"
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
 *                     $ref: '#/components/schemas/EvaluacionExposicionProvincial'
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
 *   /api/v1/exposicion-provincial/:id:
 *     get:
 *       summary: Iniciar evaluación de exposición provincial de un proyecto
 *       tags:
 *         - Exposicion Provincial
 *       description: |
 *            Estados: 
 *              - Instancia Provincial - En Exposicion (9)
 *       
 *            Inicia la evaluación de exposición provincial de un proyecto asignado por su ID. Obtiene la estructura de rubricas de la feria y la estructura de evaluación de exposición asociada al proyecto, ya sea que exista una evaluación previa o no.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Inicio de evaluación exitoso. Devuelve la estructura de evaluación de exposición.
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
 *   /api/v1/exposicion-provincial/confirmar/:id:
 *     get:
 *       summary: Confirmar evaluación de exposición provincial de un proyecto
 *       tags:
 *         - Exposicion Provincial
 *       description: |
 *            Estados: 
 *              - Instancia Provincial - En Exposicion (9)
 *       
 *            Confirma la evaluación de exposición provincial de un proyecto una vez que todos los evaluadores asignados han evaluado el proyecto. Solo los usuarios con roles de administrador o evaluador pueden confirmar la evaluación.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto a evaluar.
 *       security:
 *         - bearerAuth: []
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
 *   /api/v1/exposicion-provincial/consultar/:id:
 *     get:
 *       summary: Consultar evaluación de exposición provincial de un proyecto. Sin validación de estados de Feria.
 *       tags:
 *         - Exposicion Provincial
 *       description: Consulta la evaluación de un proyecto y devuelve la estructura de rubricas y los datos de evaluación asociados, si existen. Solo los usuarios con roles de administrador, evaluador, comAsesora o refEvaluador pueden acceder a esta información.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto para el cual se desea consultar la evaluación de exposición provincial.
 *       security:
 *         - bearerAuth: []
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
 *   /api/v1/exposicion-provincial/:id:
 *     delete:
 *       summary: Cancelar evaluación de exposición provincial de un proyecto
 *       tags:
 *         - Exposicion Provincial
 *       description: |
 *            Estados: 
 *              - Instancia Provincial - En Exposicion (9)
 *       
 *            Permite al usuario evaluador cancelar la evaluación de exposición provincial de un proyecto si está en curso. Sólo el evaluador que se encuentra evaluando el proyecto en este momento puede acceder a esta función.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto para el cual se desea cancelar la evaluación de exposición provincial.
 *       security:
 *         - bearerAuth: []
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
