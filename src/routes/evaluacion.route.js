/**
 * @swagger
 * tags:
 *   name: Evaluacion
 *   description: Operaciones relacionadas con la evaluación teórica de proyectos
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import {
  checkRolAuth,
  esEvaluadorDelProyecto,
  esReferenteDelProyecto,
} from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import {
  cancelarEvaluacion,
  confirmarEvaluacion,
  evaluarProyecto,
  iniciarEvaluacion,
  visualizarEvaluacion,
  obtenerEvaluacionesPendientes,
  obtenerEvaluacionPendienteById,
} from "../controllers/evaluaciones.controller.js";
import { evaluacionValidator } from "../middlewares/validationManagerEvaluacion.js";
import { estado } from "../middlewares/validar-fechas.js";
import { estadoFeria } from "../models/Feria.js";

const routerEvaluacion = Router();

routerEvaluacion.post(
  "/:id",
  estado([estadoFeria.instanciaRegional_EnEvaluacion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  evaluacionValidator,
  evaluarProyecto
);
routerEvaluacion.get(
  "/pendientes",
  estado([estadoFeria.instanciaRegional_EnEvaluacion, estadoFeria.instanciaRegional_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador, roles.refEvaluador]),
  obtenerEvaluacionesPendientes
);
routerEvaluacion.get(
  "/pendientes/:id",
  estado([estadoFeria.instanciaRegional_EnEvaluacion, estadoFeria.instanciaRegional_EnExposicion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador, roles.refEvaluador, roles.comAsesora]),
  obtenerEvaluacionPendienteById
);
routerEvaluacion.get(
  "/:id",
  estado([estadoFeria.instanciaRegional_EnEvaluacion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  iniciarEvaluacion
);
routerEvaluacion.get(
  "/confirmar/:id",
  estado([estadoFeria.instanciaRegional_EnEvaluacion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  confirmarEvaluacion
);
routerEvaluacion.get(
  "/consultar/:id",
  requireToken,
  checkRolAuth([
    roles.admin,
    roles.evaluador,
    roles.comAsesora,
    roles.refEvaluador,
  ]),
  esEvaluadorDelProyecto,
  esReferenteDelProyecto,
  visualizarEvaluacion
);
routerEvaluacion.delete(
  "/:id",
  estado([estadoFeria.instanciaRegional_EnEvaluacion]),
  requireToken,
  checkRolAuth([roles.admin, roles.evaluador]),
  esEvaluadorDelProyecto,
  cancelarEvaluacion
);

export default routerEvaluacion;

// DOCUMENTACIÓN SWAGGER ------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * paths:
 *   /api/v1/evaluacion/:id:
 *     post:
 *       summary: Evaluar un proyecto asignado por su ID.
 *       tags:
 *         - Evaluacion
 *       description: |
 *            Estados: 
 *              - Instancia Regional - En Evaluación (4)
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
 *       summary: Iniciar la evaluación de un proyecto asignado por su ID.
 *       tags:
 *         - Evaluacion
 *       description: |
 *            Estados: 
 *              - Instancia Regional - En Evaluación (4)
 * 
 *            Obtiene la estructura de rubricas de la feria y la estructura de evaluación teórica asociada al proyecto, ya sea que exista una evaluación previa o no.
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
 *       description: |
 *            Estados: 
 *              - Instancia Regional - En Evaluación (4)
 *          
 *            Confirma la evaluación de un proyecto una vez que todos los evaluadores asignados han evaluado el proyecto. Solo los usuarios con roles de administrador o evaluador pueden confirmar la evaluación.
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
 *   /api/v1/evaluacion/consultar/:id:
 *     get:
 *       summary: Consultar evaluación de un proyecto. Sin validación de estados de Feria.
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
 *   /api/v1/evaluacion/:id:
 *     delete:
 *       summary: Cancelar evaluación de un proyecto
 *       tags:
 *         - Evaluacion
 *       description: |
 *            Estados: 
 *              - Instancia Regional - En Evaluación (4)
 * 
 *            Permite al usuario evaluador cancelar la evaluación de un proyecto si está en curso. Sólo el evaluador que se encuentra evaluando el proyecto en este momento puede acceder a esta función.
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: ID del proyecto para el cual se desea cancelar la evaluación.
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

/**
 * @swagger
 * /api/v1/evaluacion/pendientes:
 *   get:
 *     summary: Obtener evaluaciones pendientes.
 *     tags:
 *       - Evaluacion
 *       - Exposicion
 *     description: |
 *          Estados: 
 *            - Instancia Regional - En Evaluación (4)
 *            - Instancia Regional - En Exposicion (6)
 * 
 *          Obtiene una lista de evaluaciones pendientes para el usuario actual.
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *         description: Título para filtrar proyectos (búsqueda por patrón similar).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Éxito. Devuelve una lista de evaluaciones pendientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyectos:
 *                   type: array
 *                   description: Lista de proyectos con evaluaciones pendientes.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID del proyecto.
 *                       titulo:
 *                         type: string
 *                         description: Título del proyecto.
 *                       descripcion:
 *                         type: string
 *                         description: Descripción del proyecto.
 *                       nivel:
 *                         type: string
 *                         description: Nivel del proyecto.
 *                       categoria:
 *                         type: string
 *                         description: Categoría del proyecto.
 *                       establecimientoEducativo:
 *                         type: string
 *                         description: Establecimiento educativo del proyecto.
 *                       emailEscuela:
 *                         type: string
 *                         description: Correo electrónico de la escuela.
 *                       idResponsable:
 *                         type: string
 *                         description: ID del responsable del proyecto.
 *                       feria:
 *                         type: string
 *                         description: ID de la feria asociada al proyecto.
 *                       estado:
 *                         type: string
 *                         description: Estado del proyecto.
 *                       fechaInscripcion:
 *                         type: string
 *                         description: Fecha de inscripción del proyecto.
 *                       grupoProyecto:
 *                         type: array
 *                         description: Lista de miembros del grupo del proyecto.
 *                       autorizacionImagen:
 *                         type: string
 *                         description: URL de autorización de imágenes.
 *                       carpetaCampo:
 *                         type: string
 *                         description: URL de la carpeta de campo del proyecto.
 *                       id_carpeta_drive:
 *                         type: string
 *                         description: ID de la carpeta en Google Drive.
 *                       informeTrabajo:
 *                         type: string
 *                         description: URL del informe de trabajo del proyecto.
 *                       registroPedagogico:
 *                         type: string
 *                         description: URL del registro pedagógico del proyecto.
 *                       evaluadoresRegionales:
 *                         type: array
 *                         description: Lista de IDs de evaluadores regionales asignados al proyecto.
 *                       nombreEstado:
 *                         type: string
 *                         description: Nombre del estado actual del proyecto.
 *                       evaluacion:
 *                         type: object
 *                         description: Datos de la evaluación asociada al proyecto (si está disponible).
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID de la evaluación.
 *                           evaluadorId:
 *                             type: array
 *                             description: Lista de IDs de evaluadores que realizaron la evaluación al menos una vez.
 *                           puntajeTeorico:
 *                             type: number
 *                             description: Puntaje teórico otorgado en la evaluación.
 *                           listo:
 *                             type: array
 *                             description: Lista de IDs de evaluadores que han confirmado la evaluación.
 *                           estado:
 *                             type: string
 *                             description: Estado actual de la evaluación.
 *                           nombreEstado:
 *                             type: string
 *                             description: Nombre del estado actual de la evaluación.
 *                           ultimaEvaluacion:
 *                             type: string
 *                             description: ID del último evaluador que realizó la evaluación.
 *                           evaluando:
 *                             type: string
 *                             description: ID del evaluador que está realizando la evaluación en curso (si está disponible).
 *                       exposicion:
 *                         type: object
 *                         description: Datos de la evaluación asociada al proyecto (si está disponible).
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID de la evaluación.
 *                           evaluadorId:
 *                             type: array
 *                             description: Lista de IDs de evaluadores que realizaron la evaluación al menos una vez.
 *                           puntajeExposicion:
 *                             type: number
 *                             description: Puntaje de exposición otorgado en la evaluación.
 *                           puntajeFinal:
 *                             type: number
 *                             description: Puntaje final otorgado al proyecto (suma de teórico y exposición).
 *                           listo:
 *                             type: array
 *                             description: Lista de IDs de evaluadores que han confirmado la evaluación.
 *                           estado:
 *                             type: string
 *                             description: Estado actual de la evaluación.
 *                           nombreEstado:
 *                             type: string
 *                             description: Nombre del estado actual de la evaluación.
 *                           ultimaEvaluacion:
 *                             type: string
 *                             description: ID del último evaluador que realizó la evaluación.
 *                           evaluando:
 *                             type: string
 *                             description: ID del evaluador que está realizando la evaluación en curso (si está disponible).
 *             example:
 *               proyectos:
 *                 - _id: "64ff135a816053f97af6c165"
 *                   titulo: "Casa Inteligente"
 *                   descripcion: "Test"
 *                   nivel: "64fd1a8cad4c6e68aac561c1"
 *                   categoria: "64fd1a8cad4c6e68aac561d1"
 *                   establecimientoEducativo: "64fd1a95ad4c6e68aac561e4"
 *                   emailEscuela: "escuela@test.com"
 *                   idResponsable: "64fd22ba0a0f7d5ce9518ff9"
 *                   feria: "64fd22332ff0def81fb192f8"
 *                   estado: "0"
 *                   fechaInscripcion: "2023-09-11T13:17:14.286Z"
 *                   grupoProyecto: []
 *                   autorizacionImagen: "https://drive.google.com/file/d/1J-ALaKfTxCEOy2AaQJF0FK914BjG3F6i/preview"
 *                   carpetaCampo: "https://drive.google.com/file/d/16lemohQnFJq-socQEKWYf2-u-4U5opbe/preview"
 *                   id_carpeta_drive: "1HAXnbEaNWIr4eT-JkKzlWR1jQXVA_yWP"
 *                   informeTrabajo: "https://drive.google.com/file/d/1SA4ediBscEffRrWezW8zblZwIs7sql2x/preview"
 *                   registroPedagogico: "https://drive.google.com/file/d/15pPLyNOO0YuS1gmM3sqe6JHwQyn1iiW_/preview"
 *                   evaluadoresRegionales:
 *                     - "6500f3926b839eed0a99b55f"
 *                     - "6504c5aec6266617467ca0ca"
 *                   nombreEstado: "Instancia escolar"
 *                   evaluacion:
 *                     _id: "650db75b7dd72ab4aaa0a54e"
 *                     evaluadorId:
 *                       - "6500f3926b839eed0a99b55f"
 *                       - "6504c5aec6266617467ca0ca"
 *                     puntajeTeorico: 100
 *                     listo:
 *                       - "6504c5aec6266617467ca0ca"
 *                       - "6500f3926b839eed0a99b55f"
 *                     estado: "3"
 *                     nombreEstado: "Cerrada"
 *                     ultimaEvaluacion: "6500f3926b839eed0a99b55f"
 *                     evaluando: null
 *                   exposicion:
 *                     _id: "650db75b7dd72ab4aaa0a54e"
 *                     evaluadorId:
 *                       - "6500f3926b839eed0a99b55f"
 *                       - "6504c5aec6266617467ca0ca"
 *                     puntajeExposicion: 100
 *                     puntajeFinal: 100
 *                     listo:
 *                       - "6504c5aec6266617467ca0ca"
 *                       - "6500f3926b839eed0a99b55f"
 *                     estado: "3"
 *                     nombreEstado: "Cerrada"
 *                     ultimaEvaluacion: "6500f3926b839eed0a99b55f"
 *                     evaluando: null
 *                 - _id: "64ffd509cd8baf7a43ea7bff"
 *                   titulo: "Electricidad II"
 *                   descripcion: "Test"
 *                   nivel: "64fd1a8cad4c6e68aac561c1"
 *                   categoria: "64fd1a8cad4c6e68aac561d1"
 *                   establecimientoEducativo: "64fd1a95ad4c6e68aac561e4"
 *                   emailEscuela: "escuela@test.com"
 *                   idResponsable: "64fd22ba0a0f7d5ce9518ff9"
 *                   feria: "64fd22332ff0def81fb192f8"
 *                   estado: "0"
 *                   fechaInscripcion: "2023-09-12T03:03:37.740Z"
 *                   grupoProyecto: []
 *                   autorizacionImagen: "https://drive.google.com/file/d/1n1xivyAz7SU8v0ubSUE_xm5mKx3DScj-/preview"
 *                   carpetaCampo: "https://drive.google.com/file/d/16Y3AB1nT_0MBZqf2eKxCo_JRPMluIV_3/preview"
 *                   id_carpeta_drive: "1LLCATYfQfxMG40XlQnxIpnM5Z6q8iT0a"
 *                   informeTrabajo: "https://drive.google.com/file/d/1L9A4ztbvByeZ-P_DxruO4BsfCGjKPxwE/preview"
 *                   registroPedagogico: "https://drive.google.com/file/d/1-ZVfFP0BbwX9YqLjVDvhCySPPWnCdGDV/preview"
 *                   evaluadoresRegionales:
 *                     - "6500f3926b839eed0a99b55f"
 *                     - "6504c5aec6266617467ca0ca"
 *                   nombreEstado: "Instancia escolar"
 *       204:
 *         description: No Content. No se encontraron evaluaciones pendientes.
 *       500:
 *         description: Error del servidor.
 */

/**
 * @swagger
 * /api/v1/evaluacion/pendientes/:id:
 *   get:
 *     summary: Obtener evaluación pendiente por ID
 *     tags:
 *       - Evaluacion
 *       - Exposicion
 *     description: |
 *          Estados: 
 *            - Instancia Regional - En Evaluación (4)
 *            - Instancia Regional - En Exposicion (6)
 * 
 *          Obtiene una evaluación pendiente por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del proyecto
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evaluación pendiente encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del proyecto.
 *                     titulo:
 *                       type: string
 *                       description: Título del proyecto.
 *                     descripcion:
 *                       type: string
 *                       description: Descripción del proyecto.
 *                     nivel:
 *                       type: string
 *                       description: Nivel del proyecto.
 *                     categoria:
 *                       type: string
 *                       description: Categoría del proyecto.
 *                     establecimientoEducativo:
 *                       type: string
 *                       description: Establecimiento educativo del proyecto.
 *                     emailEscuela:
 *                       type: string
 *                       description: Correo electrónico de la escuela.
 *                     idResponsable:
 *                       type: string
 *                       description: ID del responsable del proyecto.
 *                     feria:
 *                       type: string
 *                       description: ID de la feria asociada al proyecto.
 *                     estado:
 *                       type: string
 *                       description: Estado del proyecto.
 *                     fechaInscripcion:
 *                       type: string
 *                       description: Fecha de inscripción del proyecto.
 *                     grupoProyecto:
 *                       type: array
 *                       description: Lista de miembros del grupo del proyecto.
 *                     autorizacionImagen:
 *                       type: string
 *                       description: URL de autorización de imágenes.
 *                     carpetaCampo:
 *                       type: string
 *                       description: URL de la carpeta de campo del proyecto.
 *                     id_carpeta_drive:
 *                       type: string
 *                       description: ID de la carpeta en Google Drive.
 *                     informeTrabajo:
 *                       type: string
 *                       description: URL del informe de trabajo del proyecto.
 *                     registroPedagogico:
 *                       type: string
 *                       description: URL del registro pedagógico del proyecto.
 *                     evaluadoresRegionales:
 *                       type: array
 *                       description: Lista de IDs de evaluadores regionales asignados al proyecto.
 *                     nombreEstado:
 *                       type: string
 *                       description: Nombre del estado actual del proyecto.
 *                     evaluacion:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la evaluación.
 *                         evaluadorId:
 *                           type: array
 *                           description: Lista de IDs de evaluadores que realizaron la evaluación al menos una vez.
 *                         puntajeTeorico:
 *                           type: number
 *                           description: Puntaje teórico otorgado en la evaluación.
 *                         listo:
 *                           type: array
 *                           description: Lista de IDs de evaluadores que han confirmado la evaluación.
 *                         estado:
 *                           type: string
 *                           description: Estado actual de la evaluación.
 *                         nombreEstado:
 *                           type: string
 *                           description: Nombre del estado actual de la evaluación.
 *                         ultimaEvaluacion:
 *                           type: string
 *                           description: ID del último evaluador que realizó la evaluación.
 *                         evaluando:
 *                           type: string
 *                           description: ID del evaluador que está realizando la evaluación en curso (si está disponible).
 *                     exposicion:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID de la evaluación.
 *                         evaluadorId:
 *                           type: array
 *                           description: Lista de IDs de evaluadores que realizaron la evaluación al menos una vez.
 *                         puntajeExposicion:
 *                           type: number
 *                           description: Puntaje de exposición otorgado en la evaluación.
 *                         puntajeFinal:
 *                           type: number
 *                           description: Puntaje final otorgado al proyecto (suma de teórico y exposición).
 *                         listo:
 *                           type: array
 *                           description: Lista de IDs de evaluadores que han confirmado la evaluación.
 *                         estado:
 *                           type: string
 *                           description: Estado actual de la evaluación.
 *                         nombreEstado:
 *                           type: string
 *                           description: Nombre del estado actual de la evaluación.
 *                         ultimaEvaluacion:
 *                           type: string
 *                           description: ID del último evaluador que realizó la evaluación.
 *                         evaluando:
 *                           type: string
 *                           description: ID del evaluador que está realizando la evaluación en curso (si está disponible).
 *             example:
 *               proyecto:
 *                 id: "64ff135a816053f97af6c165"
 *                 titulo: "Casa Inteligente"
 *                 descripcion: "Test"
 *                 nivel: "64fd1a8cad4c6e68aac561c1"
 *                 categoria: "64fd1a8cad4c6e68aac561d1"
 *                 establecimientoEducativo: "64fd1a95ad4c6e68aac561e4"
 *                 emailEscuela: "escuela@test.com"
 *                 idResponsable: "64fd22ba0a0f7d5ce9518ff9"
 *                 feria: "64fd22332ff0def81fb192f8"
 *                 estado: "0"
 *                 fechaInscripcion: "2023-09-11T13:17"
 *                 grupoProyecto: []
 *                 autorizacionImagen: "https://drive.google.com/file/d/1J-ALaKfTxCEOy2AaQJF0FK914BjG3F6i/preview"
 *                 carpetaCampo: "https://drive.google.com/file/d/16lemohQnFJq-socQEKWYf2-u-4U5opbe/preview"
 *                 id_carpeta_drive: "1HAXnbEaNWIr4eT-JkKzlWR1jQXVA_yWP"
 *                 informeTrabajo: "https://drive.google.com/file/d/1SA4ediBscEffRrWezW8zblZwIs7sql2x/preview"
 *                 registroPedagogico: "https://drive.google.com/file/d/15pPLyNOO0YuS1gmM3sqe6JHwQyn1iiW_/preview"
 *                 evaluadoresRegionales:
 *                   - "6500f3926b839eed0a99b55f"
 *                   - "6504c5aec6266617467ca0ca"
 *                 nombreEstado: "Instancia escolar"
 *                 evaluacion:
 *                   id: "650db75b7dd72ab4aaa0a54e"
 *                   evaluadorId:
 *                     - "6500f3926b839eed0a99b55f"
 *                     - "6504c5aec6266617467ca0ca"
 *                   puntajeTeorico: 100
 *                   listo:
 *                     - "6504c5aec6266617467ca0ca"
 *                     - "6500f3926b839eed0a99b55f"
 *                   estado: "3"
 *                   nombreEstado: "Cerrada"
 *                   ultimaEvaluacion: "6500f3926b839eed0a99b55f"
 *                   evaluando: null
 *                 exposicion:
 *                   id: "650db75b7dd72ab4aaa0a54e"
 *                   evaluadorId:
 *                     - "6500f3926b839eed0a99b55f"
 *                     - "6504c5aec6266617467ca0ca"
 *                   puntajeExposicion: 100
 *                   puntajeFinal: 100
 *                   listo:
 *                     - "6504c5aec6266617467ca0ca"
 *                     - "6500f3926b839eed0a99b55f"
 *                   estado: "3"
 *                   nombreEstado: "Cerrada"
 *                   ultimaEvaluacion: "6500f3926b839eed0a99b55f"
 *                   evaluando: null
 *       404:
 *         description: No se encontró la evaluación pendiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error de servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
