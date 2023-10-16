/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Operaciones relacionadas con los proyectos
 */

import { Router } from "express";
import { requireToken } from "../middlewares/requireToken.js";
import {
  bajaProyecto,
  consultarMisProyectos,
  consultarProyecto,
  consultarProyectos,
  eliminarProyecto,
  inscribirProyectoEscolar,
  modificarProyectoEscolar,
  modificarProyectoRegional,
  cargarArchivosRegional,
  actualizarArchivosRegional,
  downloadDocuments,
  downloadDocumentEspecific,
  generarPDFconQR
} from "../controllers/proyectos.controller.js";
import {
  bodyInscribirProyectoValidator,
  bodyActualizarProyectoRegionalValidator,
} from "../middlewares/validationManager.js";
import { checkRolAuth, esPropietario } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { BodyValidationDrive , validarArchivosPDF  } from "../middlewares/validationDrive.js";
import { fecha } from "../middlewares/validar-fechas.js";
import { fechasFeria } from "../models/Feria.js";

const routerProyectos = Router();

routerProyectos.post(
  "/",
  requireToken,
  checkRolAuth([roles.admin, roles.docente]),
  //fecha(fechasFeria.fechaInicio, fechasFeria.fechaFinEscolar),
  bodyInscribirProyectoValidator,
  inscribirProyectoEscolar
);
routerProyectos.get(
  "/misProyectos",
  requireToken,
  checkRolAuth([roles.admin, roles.responsableProyecto, roles.docente]),
  consultarMisProyectos
);
routerProyectos.get(
  "/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.responsableProyecto]),
  esPropietario,
  consultarProyecto
);
routerProyectos.get(
  "/",
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora]),
  consultarProyectos
);
routerProyectos.patch(
  "/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.responsableProyecto]),
  //fecha(fechasFeria.fechaInicio, fechasFeria.fechaFinEscolar),
  esPropietario,
  bodyInscribirProyectoValidator,
  modificarProyectoEscolar
);
routerProyectos.patch(
  "/regional/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.responsableProyecto]),
  //fecha(fechasFeria.fechaFinEscolar, fechasFeria.fechaInicioEvaluacionRegional),
  esPropietario,
  bodyInscribirProyectoValidator,
  bodyActualizarProyectoRegionalValidator,
  modificarProyectoRegional
);
//routerProyectos.patch("/regional/update/:id", requireToken, checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario, bodyActualizarProyectoRegionalValidator, actualizarProyectoRegional);
routerProyectos.delete(
  "/delete/:id",
  requireToken,
  checkRolAuth([roles.admin]),
  eliminarProyecto
);
routerProyectos.delete(
  "/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.comAsesora, roles.responsableProyecto]),
  //fecha(fechasFeria.fechaInicio, fechasFeria.fechaFinEscolar),
  esPropietario,
  bajaProyecto
);

//recibo por parametro el id del proyecto y los archivos por form-data
routerProyectos.post(
  "/regional/upload/:id",
    requireToken,
    BodyValidationDrive,
    checkRolAuth([roles.admin, roles.responsableProyecto]),
    //fecha(fechasFeria.fechaFinEscolar, fechasFeria.fechaInicioEvaluacionRegional),
    esPropietario,
    //validarArchivosPDF,
  cargarArchivosRegional
);

routerProyectos.patch(
  "/regional/upload/:id",
    requireToken,
    BodyValidationDrive,
    checkRolAuth([roles.admin, roles.responsableProyecto]),
    //fecha(fechasFeria.fechaFinEscolar, fechasFeria.fechaInicioEvaluacionRegional),
    esPropietario,
    actualizarArchivosRegional
);

routerProyectos.get(
  "/download/:id",
    requireToken,
    BodyValidationDrive,
    checkRolAuth([roles.admin, roles.responsableProyecto]),
    //fecha(fechasFeria.fechaFinEscolar, fechasFeria.fechaInicioEvaluacionRegional),
    esPropietario,
    downloadDocuments
);

routerProyectos.get(
  "/download/:id/:name",
    requireToken,
    BodyValidationDrive,
    checkRolAuth([roles.admin, roles.responsableProyecto]),
    //fecha(fechasFeria.fechaFinEscolar, fechasFeria.fechaInicioEvaluacionRegional),
    downloadDocumentEspecific
);


routerProyectos.get(
  "/generarQR/:id",
  requireToken,
  checkRolAuth([roles.admin, roles.responsableProyecto]),
  esPropietario,
  generarPDFconQR
)


// requireToken , checkRolAuth([roles.admin, roles.responsableProyecto]), esPropietario,
export default routerProyectos;



// DOCUMENTACION SWAGGER -------------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/proyecto:
 *   post:
 *     summary: Inscribir un proyecto escolar
 *     tags: [Proyectos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del proyecto.
 *               descripcion:
 *                 type: string
 *                 description: Descripción del proyecto.
 *               nivel:
 *                 type: string
 *                 description: Nivel educativo del proyecto.
 *               categoria:
 *                 type: string
 *                 description: Categoría del proyecto.
 *               establecimientoEducativo:
 *                 type: string
 *                 description: ID del establecimiento educativo.
 *               emailEscuela:
 *                 type: string
 *                 description: Correo electrónico de la escuela.
 *     responses:
 *       '200':
 *         description: Proyecto escolar inscrito exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Indica si la inscripción fue exitosa.
 *       '400':
 *         description: Error en la solicitud debido a un proyecto duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '401':
 *         description: Error en la solicitud debido a una feria no activa o docente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, docente]
 */


/**
 * @swagger
 * /api/v1/proyecto/misProyectos:
 *   get:
 *     summary: Consultar mis proyectos
 *     tags: [Proyectos]
 *     parameters:
 *       - name: titulo
 *         in: query
 *         schema:
 *           type: string
 *         description: Título del proyecto a consultar (opcional).
 *       - name: descripcion
 *         in: query
 *         schema:
 *           type: string
 *         description: Descripción del proyecto a consultar (opcional).
 *       - name: nivel
 *         in: query
 *         schema:
 *           type: string
 *         description: Nivel educativo del proyecto a consultar (opcional).
 *       - name: categoria
 *         in: query
 *         schema:
 *           type: string
 *         description: Categoría del proyecto a consultar (opcional).
 *       - name: establecimientoEducativo
 *         in: query
 *         schema:
 *           type: string
 *         description: ID del establecimiento educativo a consultar (opcional).
 *       - name: emailEscuela
 *         in: query
 *         schema:
 *           type: string
 *         description: Correo electrónico de la escuela a consultar (opcional).
 *       - name: idResponsable
 *         in: query
 *         schema:
 *           type: string
 *         description: ID del responsable del proyecto a consultar (opcional).
 *       - name: fechaInscripcion
 *         in: query
 *         schema:
 *           type: string
 *         description: Fecha de inscripción del proyecto a consultar (opcional).
 *       - name: feria
 *         in: query
 *         schema:
 *           type: string
 *         description: ID de la feria del proyecto a consultar (opcional).
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *         description: Estado del proyecto a consultar (opcional).
 *       - name: videoPresentacion
 *         in: query
 *         schema:
 *           type: string
 *         description: Video de presentación del proyecto a consultar (opcional).
 *       - name: registroPedagogico
 *         in: query
 *         schema:
 *           type: string
 *         description: Registro pedagógico del proyecto a consultar (opcional).
 *       - name: carpetaCampo
 *         in: query
 *         schema:
 *           type: string
 *         description: Carpeta de campo del proyecto a consultar (opcional).
 *       - name: informeTrabajo
 *         in: query
 *         schema:
 *           type: string
 *         description: Informe de trabajo del proyecto a consultar (opcional).
 *       - name: sede
 *         in: query
 *         schema:
 *           type: string
 *         description: Sede del proyecto a consultar (opcional).
 *       - name: autorizacionImagen
 *         in: query
 *         schema:
 *           type: string
 *         description: Autorización de imagen del proyecto a consultar (opcional).
 *     responses:
 *       '200':
 *         description: Lista de proyectos consultados con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyectos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Proyecto'
 *       '204':
 *         description: No se encontraron proyectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '401':
 *         description: Error en la solicitud debido a un docente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, responsableProyecto, docente]
 */



/**
 * @swagger
 * /api/v1/proyecto/:id:
 *   get:
 *     summary: Consultar proyecto por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a consultar.
 *     responses:
 *       '200':
 *         description: Proyecto consultado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '401':
 *         description: Error en la solicitud debido a un proyecto no encontrado o inactivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '403':
 *         description: Error en la solicitud debido a un formato de ID incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, responsableProyecto]
 */


/**
 * @swagger
 * /api/v1/proyecto:
 *   get:
 *     summary: Consultar proyectos
 *     tags: [Proyectos]
 *     parameters:
 *       - name: titulo
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por título del proyecto.
 *       - name: descripcion
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por descripción del proyecto.
 *       - name: nivel
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por nivel del proyecto.
 *       - name: categoria
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por categoría del proyecto.
 *       - name: establecimientoEducativo
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por establecimiento educativo del proyecto.
 *       - name: emailEscuela
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por email de la escuela del proyecto.
 *       - name: idResponsable
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por ID del responsable del proyecto.
 *       - name: fechaInscripcion
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por fecha de inscripción del proyecto.
 *       - name: feria
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por feria del proyecto.
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por estado del proyecto.
 *       - name: videoPresentacion
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por video de presentación del proyecto.
 *       - name: registroPedagogico
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por registro pedagógico del proyecto.
 *       - name: carpetaCampo
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por carpeta de campo del proyecto.
 *       - name: informeTrabajo
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por informe de trabajo del proyecto.
 *       - name: sede
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por sede del proyecto.
 *       - name: autorizacionImagen
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por autorización de imagen del proyecto.
 *     responses:
 *       '200':
 *         description: Proyectos consultados con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyectos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Proyecto'
 *       '204':
 *         description: No se han encontrado proyectos que coincidan con los filtros.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 * /api/v1/proyecto/:id:
 *   patch:
 *     summary: Modificar proyecto escolar por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Nuevo título del proyecto.
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del proyecto.
 *               nivel:
 *                 type: string
 *                 description: Nuevo nivel del proyecto.
 *               categoria:
 *                 type: string
 *                 description: Nueva categoría del proyecto.
 *               establecimientoEducativo:
 *                 type: string
 *                 description: Nuevo establecimiento educativo del proyecto.
 *               emailEscuela:
 *                 type: string
 *                 description: Nuevo email de la escuela del proyecto.
 *     responses:
 *       '200':
 *         description: Proyecto modificado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '404':
 *         description: No se encuentra el proyecto o está dado de baja.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '400':
 *         description: El nuevo título del proyecto ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '403':
 *         description: Formato ID incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, responsableProyecto]
 */


/**
 * @swagger
 * /api/v1/proyecto/regional/:id:
 *   patch:
 *     summary: Modificar proyecto regional por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto regional a modificar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Nuevo título del proyecto.
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del proyecto.
 *               nivel:
 *                 type: string
 *                 description: Nuevo nivel del proyecto.
 *               categoria:
 *                 type: string
 *                 description: Nueva categoría del proyecto.
 *               establecimientoEducativo:
 *                 type: string
 *                 description: Nuevo establecimiento educativo del proyecto.
 *               emailEscuela:
 *                 type: string
 *                 description: Nuevo email de la escuela del proyecto.
 *               sede:
 *                 type: string
 *                 description: Nueva sede del proyecto regional.
 *               grupoProyecto:
 *                 type: string
 *                 description: Nuevo grupo del proyecto.
 *     responses:
 *       '200':
 *         description: Proyecto regional modificado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '404':
 *         description: No se encuentra el proyecto o está dado de baja.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '400':
 *         description: El nuevo título del proyecto ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '403':
 *         description: Formato ID incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, responsableProyecto]
 */



/**
 * @swagger
 * /api/v1/proyecto/delete/:id:
 *   delete:
 *     summary: Eliminar proyecto por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a eliminar.
 *     responses:
 *       '200':
 *         description: Proyecto eliminado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '404':
 *         description: No se encuentra el proyecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '403':
 *         description: Formato ID incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin]
 */


/**
 * @swagger
 * /api/v1/proyecto/:id:
 *   delete:
 *     summary: Dar de baja un proyecto por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a dar de baja.
 *     responses:
 *       '200':
 *         description: Proyecto dado de baja con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '404':
 *         description: No se encuentra el proyecto o ya está inactivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '403':
 *         description: Formato ID incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
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
 *       - roles: [admin, comAsesora, responsableProyecto]
 */


/**
 * @swagger
 * /api/v1/proyecto/regional/upload/:id:
 *   post:
 *     summary: Cargar archivos regionales de un proyecto por ID
 *     tags: [Proyectos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto al que se cargarán los archivos regionales.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               carpetaCampo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de la carpeta de campo.
 *               registroPedagogicopdf:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF del registro pedagógico.
 *               informeTrabajo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF del informe de trabajo.
 *               autorizacionImagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de autorización de imágenes.
 *     responses:
 *       '200':
 *         description: Archivos regionales cargados con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_inform_tranajp:
 *                   type: string
 *                   description: URL del informe de trabajo en Google Drive.
 *                 msg:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                 proyecto:
 *                   $ref: '#/components/schemas/Proyecto'
 *       '400':
 *         description: Error al cargar archivos regionales o formato incorrecto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Mensaje de error.
 *       '500':
 *         description: Error de servidor interno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Mensaje de error.
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, responsableProyecto]
 */



/**
 * @swagger
 * /api/v1/proyecto/generarQR/:id:
 *   get:
 *     summary: Genera un PDF con un código QR para un proyecto específico
 *     tags: 
 *       - Proyectos
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Archivo PDF con el código QR del proyecto
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No se encuentra el proyecto
 *       500:
 *         description: Error interno del servidor al generar el PDF
 */