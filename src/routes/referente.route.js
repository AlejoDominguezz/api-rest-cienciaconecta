/**
 * @swagger
 * tags:
 *   name: Referente
 *   description: Operaciones relacionadas con los referentes de evaluacion
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth, esReferenteDelProyecto } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { asignarEvaluadoresAProyecto, eliminarAsignaciónEvaluadorAProyecto, obtenerEvaluadores, obtenerListadoDocentes, obtenerProyectosAsignadosAReferente, obtenerReferentesSeleccionados, seleccionarReferentes } from "../controllers/referentes.controller.js";
import { asignarEvaluadorValidator, desasignarEvaluadorValidator, seleccionarReferentesValidator } from "../middlewares/validationManagerReferente.js";


const routerReferente = Router();

routerReferente.post("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), seleccionarReferentesValidator, seleccionarReferentes);
routerReferente.get("/", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerListadoDocentes);
routerReferente.get("/asignados", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), obtenerReferentesSeleccionados);
routerReferente.get("/proyectos", requireToken, checkRolAuth([roles.admin, roles.refEvaluador]), obtenerProyectosAsignadosAReferente);
routerReferente.post('/asignar/:id', requireToken, checkRolAuth([roles.admin, roles.refEvaluador]), asignarEvaluadorValidator, esReferenteDelProyecto, asignarEvaluadoresAProyecto)
routerReferente.post('/desasignar/:id', requireToken, checkRolAuth([roles.admin, roles.refEvaluador]), desasignarEvaluadorValidator, esReferenteDelProyecto, eliminarAsignaciónEvaluadorAProyecto)
routerReferente.get('/evaluadores/:id', requireToken, checkRolAuth([roles.admin, roles.refEvaluador]), esReferenteDelProyecto, obtenerEvaluadores)




export default routerReferente;



// DOCUMENTACION SWAGGER ----------------------------------------------------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/referente:
 *   post:
 *     summary: Seleccionar referentes
 *     description: Crea referentes y asigna roles a docentes como referentes de evaluador.
 *     tags:
 *       - Referente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seleccion:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sede:
 *                       type: string
 *                       description: ID de la sede a la cual se quiere asignar el referente de evaluador.
 *                     referente:
 *                       type: string
 *                       description: ID del docente que se desea seleccionar como referente.
 *                 required:
 *                   - sede
 *                   - referente
 *     responses:
 *       200:
 *         description: Se han seleccionado los referentes correctamente.
 *       401:
 *         description: Error en la selección de referentes.
 *       500:
 *         description: Error de servidor.
 */




/**
 * @swagger
 * /api/v1/referente/:id:
 *   patch:
 *     summary: Modificar un referente
 *     description: Modifica la sede de un referente seleccionado.
 *     tags:
 *       - Referente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del referente seleccionado a modificar.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Datos para la modificación del referente.
 *         schema:
 *           type: object
 *           properties:
 *             sede:
 *               type: string
 *               description: ID de la nueva sede a asignar al referente.
 *     responses:
 *       200:
 *         description: Referente modificado exitosamente.
 *       401:
 *         description: Error en la modificación del referente.
 *       500:
 *         description: Error de servidor.
 */

/**
 * @swagger
 * /api/v1/referente/:id:
 *   delete:
 *     summary: Eliminar un referente
 *     description: Elimina un referente seleccionado y revierte los roles del docente asociado.
 *     tags:
 *       - Referente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del referente seleccionado a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Referente eliminado exitosamente.
 *       401:
 *         description: Error en la eliminación del referente.
 *       500:
 *         description: Error de servidor.
 */


/**
 * @swagger
 * /api/v1/referente:
 *   get:
 *     summary: Obtener listado de docentes
 *     description: Obtiene una lista de docentes que cumplen con ciertas condiciones.
 *     tags:
 *       - Referente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cuil
 *         required: false
 *         description: Filtrar docentes por CUIL (opcional).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de docentes obtenida exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               usuarios:
 *                 - _id: "650f3c9d3beeb5958786bad7"
 *                   cuil: "20431877005"
 *                   email: "maximilianoluna3645@gmail.com"
 *                   roles:
 *                     - "6"
 *                   datos_docente:
 *                     _id: "650f3c9d3beeb5958786bad8"
 *                     nombre: "Referente"
 *                     apellido: "Evaluador 2"
 *                     telefono: "351511233"
 *                     cargo: "Ref de Evaluador 2"
 *       204:
 *         description: No existen usuarios que cumplan las condiciones.
 *       401:
 *         description: Error en la obtención de la lista de docentes.
 *       500:
 *         description: Error de servidor.
 */


/**
 * @swagger
 * /api/v1/referente/asignados:
 *   get:
 *     summary: Obtener referentes seleccionados
 *     description: Obtiene una lista de referentes seleccionados para la feria activa, incluyendo los datos del docente asociado.
 *     tags:
 *       - Referente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de referentes seleccionados obtenida exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               referentes:
 *                 - _id: "650f421b07c0ce742bd68579"
 *                   sede: "64fd1a95ad4c6e68aac561e4"
 *                   idDocente: "650e177d8c5d385cb3a18903"
 *                   evaluadoresAsignados: []
 *                   datos_docente:
 *                     nombre: "Referente"
 *                     apellido: "Evaluador"
 *                     cuil: "20431877004"
 *                     telefono: "351511233"
 *                     cargo: "Ref de Evaluador"
 *                     usuario: "650e177d8c5d385cb3a18902"
 *                 - _id: "6511ae5c5fe268459f559049"
 *                   sede: "64fd1a95ad4c6e68aac561e7"
 *                   idDocente: "650f3c9d3beeb5958786bad8"
 *                   evaluadoresAsignados: []
 *                   datos_docente:
 *                     nombre: "Referente"
 *                     apellido: "Evaluador 2"
 *                     cuil: "20431877005"
 *                     telefono: "351511233"
 *                     cargo: "Ref de Evaluador 2"
 *                     usuario: "650f3c9d3beeb5958786bad7"
 *       401:
 *         description: Error en la obtención de los referentes seleccionados.
 *       500:
 *         description: Error de servidor.
 */

/**
 * @swagger
 * /api/v1/referente/proyectos:
 *   get:
 *     summary: Obtener proyectos asignados a un referente de evaluador.
 *     description: Obtiene una lista de proyectos asignados a un referente de evaluador.
 *     tags:
 *       - Referente
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos asignados al referente de evaluador.
 *         content:
 *           application/json:
 *             example:
 *               proyectos:
 *                 - _id: "64ffda814f2c1ca77db8cc34"
 *                   titulo: "Torneria"
 *                   descripcion: "Test"
 *                   nivel: "64fd1a8cad4c6e68aac561c1"
 *                   categoria: "64fd1a8cad4c6e68aac561d1"
 *                   establecimientoEducativo: "64fd1a95ad4c6e68aac561e4"
 *                   emailEscuela: "escuela@test.com"
 *                   idResponsable: "64fd22ba0a0f7d5ce9518ff9"
 *                   feria: "64fd22332ff0def81fb192f8"
 *                   estado: "0"
 *                   fechaInscripcion: "2023-09-12T03:26:57.804Z"
 *                   grupoProyecto: []
 *                   autorizacionImagen: "https://drive.google.com/file/d/1cXBIdfxWzWA9DyYyR4IHjLdziLmIbhL2/preview"
 *                   informeTrabajo: "https://drive.google.com/file/d/1YXgio7fCaoEBThhUzAEiGtxxDa_5HH-g/preview"
 *                   registroPedagogico: "https://drive.google.com/file/d/1gynhOXJI8hvETuYs7WNBtuwE8O2ODDZ_/preview"
 *                   carpetaCampo: "https://drive.google.com/file/d/1wQhUdI5rkTHELjsn-pxZz6-bAAZ7bb-O/preview"
 *                   sede: "64fd1a95ad4c6e68aac561e7"
 *       204:
 *         description: No existen proyectos asignados al referente de evaluador.
 *       401:
 *         description: No autorizado o datos de sesión incorrectos.
 *       500:
 *         description: Error de servidor.
 */

/**
 * @swagger
 * /api/v1/referente/asignar/:id:
 *   post:
 *     summary: Asignar evaluadores a un proyecto.
 *     description: Asigna evaluadores a un proyecto específico.
 *     tags:
 *       - Referente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto al que se asignarán los evaluadores.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluadores:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID del evaluador que se asignará al proyecto
 *                   required: true
 *           example:
 *             evaluadores:
 *               - "650f4549483ba1af04c685c4"
 *               - "6500f3926b839eed0a99b55f"
 *     responses:
 *       200:
 *         description: Evaluadores asignados correctamente.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Todos los evaluadores han sido asignados correctamente al proyecto 'Casa Inteligente'"
 *       401:
 *         description: No autorizado o datos de sesión incorrectos.
 *         content:
 *           application/json:
 *             example:
 *               error: "No existe el proyecto con el ID ingresado"
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error de servidor"
 */


/**
 * @swagger
 * /api/v1/referente/desasignar/:id:
 *   post:
 *     summary: Desasignar evaluador de un proyecto.
 *     description: Desasigna un evaluador de un proyecto específico.
 *     tags:
 *       - Referente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto del que se desasignará el evaluador.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Datos de la solicitud de desasignación del evaluador.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluador:
 *                 type: string
 *                 description: ID del evaluador que se desasignará del proyecto.
 *                 required: true
 *     responses:
 *       200:
 *         description: Evaluador desasignado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Se ha eliminado la asignación del evaluador ID 650f4549483ba1af04c685c4 al proyecto 'Casa Inteligente'"
 *       401:
 *         description: No autorizado o datos de sesión incorrectos.
 *         content:
 *           application/json:
 *             example:
 *               error: "No existe el proyecto con el ID ingresado"
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error de servidor"
 */

/**
 * @swagger
 * /api/v1/referente/evaluadores/:id:
 *   get:
 *     summary: Obtener evaluadores para un proyecto.
 *     description: Obtiene una lista de evaluadores disponibles para un proyecto específico.
 *     tags:
 *       - Referente
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto para el cual se buscan evaluadores.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de evaluadores disponibles para el proyecto.
 *         content:
 *           application/json:
 *             example:
 *               evaluadores:
 *                 - id: "6500f3926b839eed0a99b55f"
 *                   docente: true
 *                   niveles:
 *                     - "64fd1a8cad4c6e68aac561bc"
 *                     - "64fd1a8cad4c6e68aac561bf"
 *                   categorias:
 *                     - "64fd1a8cad4c6e68aac561ca"
 *                     - "64fd1a8cad4c6e68aac561cb"
 *                   sede: "64fd1a95ad4c6e68aac561e4"
 *                   antecedentes:
 *                     - year: "2022"
 *                       rol: "1"
 *                       id: "6500f3926b839eed0a99b560"
 *                     - year: "2021"
 *                       rol: "1"
 *                       id: "6500f3926b839eed0a99b561"
 *                     - year: "2020"
 *                       rol: "1"
 *                       id: "6500f3926b839eed0a99b562"
 *                     - year: "2019"
 *                       rol: "1"
 *                       id: "6500f3926b839eed0a99b563"
 *                   idDocente: "64fd22ba0a0f7d5ce9518ff9"
 *                   fechaPostulacion: "2023-09-12T22:42:50.088Z"
 *                   CV: "1LY4Uc5-nQbdr28Z68vjthWhqd-Cj6P4a"
 *                   datos_docente:
 *                     nombre: "Usuario"
 *                     apellido: "Evaluador"
 *                     cuil: "20431877000"
 *                     telefono: "351511233"
 *                     cargo: "Evaluador"
 *                   coincidencia: 47.34
 *                   proyectosAsignados: 0
 *                   cantidadMaximaAsignaciones: 5
 *                 - id: "650f4549483ba1af04c685c4"
 *                   docente: true
 *                   niveles:
 *                     - "64fd1a8cad4c6e68aac561bc"
 *                     - "64fd1a8cad4c6e68aac561bd"
 *                   categorias:
 *                     - "64fd1a8cad4c6e68aac561ca"
 *                     - "64fd1a8cad4c6e68aac561d1"
 *                   sede: "64fd1a95ad4c6e68aac561e4"
 *                   antecedentes:
 *                     - year: "2014"
 *                       rol: "3"
 *                       id: "6500f3926b839eed0a99b565"
 *                   idDocente: "64fd28b1ce385972c9d23b16"
 *                   fechaPostulacion: "2023-09-23T20:01:13.474Z"
 *                   CV: "1ts79UWTwNoXPsd960E1tAEkHnh9zGpla"
 *                   datos_docente:
 *                     nombre: "Usuario"
 *                     apellido: "Responsable"
 *                     cuil: "20431877001"
 *                     telefono: "351511233"
 *                     cargo: "Responsable"
 *                   coincidencia: 79.96
 *                   proyectosAsignados: 0
 *                   cantidadMaximaAsignaciones: 5
 *       401:
 *         description: No autorizado o datos de sesión incorrectos.
 *         content:
 *           application/json:
 *             example:
 *               error: "No existe el proyecto con el ID ingresado"
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error de servidor"
 */
