/**
 * @swagger
 * tags:
 *   name: Evaluadores
 *   description: Operaciones relacionadas con los evaluadores
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import { blockRolAuth, checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import {
  postularEvaluador,
  getPostulaciones,
  seleccionarEvaluadores,
  cargarCv,
  getCv,
  getCvV2,
  getCv_,
  getPostulacionById,
  obtenerInfoResumidaEvaluador
} from "../controllers/evaluadores.controller.js";
import {
  bodyPostularEvaluadorValidator,
  bodySeleccionarEvaluadorValidator,
} from "../middlewares/validationManagerEvaluador.js";
import { fecha } from "../middlewares/validar-fechas.js";
import { fechasFeria } from "../models/Feria.js";

const routerEvaluadores = Router();

routerEvaluadores.post(
  "/postular",
  fecha(fechasFeria.fechaInicioPostulacion, fechasFeria.fechaFinPostulacion),
  requireToken,
  checkRolAuth([roles.admin, roles.docente]),
  blockRolAuth([roles.refEvaluador]),
  bodyPostularEvaluadorValidator,
  postularEvaluador
);
routerEvaluadores.post(
  "/seleccionar",
  fecha(fechasFeria.fechaInicioPostulacion, fechasFeria.fechaFinAsignacion),
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora]),
  bodySeleccionarEvaluadorValidator,
  seleccionarEvaluadores
);
routerEvaluadores.get(
  "/postulaciones",
  //fecha(fechasFeria.fechaInicioPostulacion, fechasFeria.fechaFinAsignacion),
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.refEvaluador]),
  getPostulaciones
);

routerEvaluadores.get(
  '/postulaciones/:id',
  //fecha(fechasFeria.fechaInicioPostulacion, fechasFeria.fechaFinAsignacion),
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.refEvaluador]),
  getPostulacionById
)

routerEvaluadores.post(
  "/upload/cv",
  fecha(fechasFeria.fechaInicioPostulacion, fechasFeria.fechaFinPostulacion),
  requireToken,
  checkRolAuth([roles.admin, roles.docente]),
  cargarCv
);

routerEvaluadores.get(
  "/download/v1/cv/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.refEvaluador]),
  getCv
);

routerEvaluadores.get(
  "/download/v2/cv/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.refEvaluador]),
  getCvV2
);
routerEvaluadores.get(
  "/download/v3/cv/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.refEvaluador]),
  getCv_
);

routerEvaluadores.get(
  "/info",
  requireToken,
  checkRolAuth([roles.evaluador]),
  obtenerInfoResumidaEvaluador
);

export default routerEvaluadores;

// DOCUMENTACION SWAGGER --------------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/evaluador/postular:
 *   post:
 *     summary: Postular un evaluador
 *     tags:
 *       - Evaluadores
 *     description: |
 *          Fechas Límite: 
 *            - Fecha Inicio: Inicio de postulacion
 *            - Fecha Fin: Fin de postulación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             docente: true
 *             niveles:
 *               - "64fd1a8cad4c6e68aac561bc"
 *               - "64fd1a8cad4c6e68aac561bd"
 *             categorias:
 *               - "64fd1a8cad4c6e68aac561ca"
 *               - "64fd1a8cad4c6e68aac561cb"
 *             sede: "64fd1a95ad4c6e68aac561e4"
 *             antecedentes:
 *               - year: "2019"
 *                 rol: "2"
 *               - year: "2012"
 *                 rol: "1"
 *           schema:
 *             type: object
 *             properties:
 *               docente:
 *                 type: boolean
 *                 description: Indica si es docente o investigador (True=Docente, False=Investigador).
 *               niveles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Lista de IDs de niveles a los que está asociado el evaluador.
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Lista de IDs de categorías a las que está asociado el evaluador.
 *               sede:
 *                 type: string
 *                 description: ID de la sede en la cual se quiere evaluar el evaluador.
 *               antecedentes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: string
 *                       description: Año de participación en la feria.
 *                     rol:
 *                       type: string
 *                       description: Rol del evaluador en la feria (1=Referente, 2=Evaluador, 3=Responsable).
 *                 description: Detalles de los antecedentes del evaluador en ferias.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Se ha registrado la postulación exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 evaluador:
 *                   $ref: '#/components/schemas/Evaluador'
 *       401:
 *         description: No existe el docente o No existe una feria activa en este momento.
 *       403:
 *         description: El usuario ya se ha postulado como evaluador.
 *       500:
 *         description: Error de servidor.
 */

/**
 * @swagger
 * /api/v1/evaluador/postulaciones:
 *   get:
 *     summary: Obtener postulaciones pendientes con datos de docente y postulación
 *     tags:
 *       - Evaluadores
 *     description: |
 *          Fechas Límite: 
 *            - Fecha Inicio: Inicio de postulacion
 *            - Fecha Fin: Fin de asignación
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Lista de postulaciones pendientes con datos de docente y postulación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postulaciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID de la postulación.
 *                       docente:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                             description: Nombre del docente.
 *                           apellido:
 *                             type: string
 *                             description: Apellido del docente.
 *                           cuil:
 *                             type: string
 *                             description: CUIL del docente.
 *                           telefono:
 *                             type: string
 *                             description: Número de teléfono del docente.
 *                           cargo:
 *                             type: string
 *                             description: Cargo del docente en la institución.
 *                       niveles:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Lista de IDs de niveles asociados al evaluador.
 *                       categorias:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Lista de IDs de categorías asociadas al evaluador.
 *                       sede:
 *                         type: string
 *                         description: ID de la sede en la cual se quiere evaluar el evaluador.
 *                       CV:
 *                         type: string
 *                         description: Enlace al currículum vitae del evaluador.
 *                       antecedentes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: string
 *                               description: Año de participación en la feria.
 *                             rol:
 *                               type: string
 *                               description: Rol del evaluador en la feria (1=Referente, 2=Evaluador, 3=Responsable).
 *                           description: Detalles de los antecedentes del evaluador en ferias.
 *                       feria:
 *                         type: string
 *                         description: ID de la feria para la cual se ha postulado el evaluador.
 *                       idDocente:
 *                         type: string
 *                         description: ID del docente que se ha postulado.
 *                       fechaPostulacion:
 *                         type: string
 *                         description: Fecha de postulación del evaluador.
 *                       pendiente:
 *                         type: boolean
 *                         description: Indica si la evaluación está pendiente.
 *                   description: Lista de postulaciones pendientes con datos del docente y la postulación asociada.
 *       204:
 *         description: No se han encontrado postulaciones pendientes.
 *       401:
 *         description: No se tienen los permisos adecuados para acceder a esta función.
 *       500:
 *         description: Error de servidor.
 */

/**
 * @swagger
 * /api/v1/evaluador/seleccionar:
 *   post:
 *     summary: Seleccionar evaluadores
 *     tags:
 *       - Evaluadores
 *     description: |
 *          Fechas Límite: 
 *            - Fecha Inicio: Inicio de postulacion
 *            - Fecha Fin: Fin de asignación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postulaciones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de las postulaciones de evaluadores a seleccionar.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Los evaluadores han sido seleccionados exitosamente. El primer y segundo elemento en
 *                      en responseMessage es en el caso en que uno o más mails no puedan enviarse,
 *                      se incluye un string por error. En caso de que se envien todos correctamente,
 *                      la salida será el tercer string.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Indica si la selección fue exitosa.
 *                 responseMessage:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Mensaje de respuesta.
 *                   example:
 *                     - "Fallo en el envío de mail a aximilianoluna3645@gmail.com"
 *                     - "Fallo en el envío de mail a otro_mail_incorrecto@gmail.com"
 *                     - "Se han enviado todos los emails correctamente"
 *       401:
 *         description: No existe la postulación, el docente asociado a la postulación o el usuario.
 *       403:
 *         description: El usuario ya tiene el rol de evaluador.
 *       500:
 *         description: Error de servidor.
 */
