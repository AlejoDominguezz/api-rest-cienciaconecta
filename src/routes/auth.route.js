import {Router} from 'express';
import { altaUsuarios, confirmarCuenta, consultarPendientes, login, logout, register, resetearContrasena, solicitarRecuperacionContrasena } from '../controllers/auth.controller.js';
import { bodyLoginValidator, bodyRegisterValidator } from '../middlewares/validationManager.js';
import { requireToken } from '../middlewares/requireToken.js';
import { requireRefreshToken } from '../middlewares/requireRefreshToken.js';
import { refreshToken } from '../middlewares/refreshToken.js';
import { prueba } from '../middlewares/prueba.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";

const routerAuth = Router();

routerAuth.post('/login', bodyLoginValidator, login);
routerAuth.post('/register', bodyRegisterValidator, register);
routerAuth.get('/logout', logout);
routerAuth.get('/protected', requireToken, prueba); //cambiar prueba por api correspondiente de la ruta protegida
routerAuth.get('/refresh', requireRefreshToken, refreshToken);
routerAuth.get('/confirmar/:token', confirmarCuenta)
routerAuth.post('/reset-password', resetearContrasena);
routerAuth.post('/recuperar-contrasena', solicitarRecuperacionContrasena);
routerAuth.post('/alta', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), altaUsuarios)
routerAuth.get('/pendientes', requireToken, checkRolAuth([roles.admin, roles.comAsesora]), consultarPendientes)


export default routerAuth;




// DOCUMENTACION SWAGGER
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y autorización de usuarios
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     description: Inicia sesión con un usuario registrado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuil:
 *                 type: string
 *                 description: El CUIL del usuario.
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario.
 *             example:
 *               cuil: 20431877002
 *               password: Maxi12345
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Devuelve un token de autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *                 expiresIn:
 *                   type: string
 *                   description: Tiempo de expiración del token en segundos.
 *                 id:
 *                   type: string
 *                   description: ID del usuario.
 *                 userCuil:
 *                   type: string
 *                   description: CUIL del usuario.
 *                 roles:
 *                   type: array
 *                   description: Roles del usuario.
 *                   items:
 *                     type: string
 *     400:
 *       description: Datos de inicio de sesión incorrectos o cuenta no confirmada.
 *     403:
 *       description: Usuario pendiente de activación o inactivo.
 *     500:
 *       description: Error de servidor.
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Rutas de autenticación y autorización
 *
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario.
 *               apellido:
 *                 type: string
 *                 description: El apellido del usuario.
 *               cuil:
 *                 type: string
 *                 description: El CUIL del usuario.
 *               email:
 *                 type: string
 *                 description: La dirección de correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario.
 *               telefono:
 *                 type: string
 *                 description: El número de teléfono del usuario.
 *               cargo:
 *                 type: string
 *                 description: El cargo del usuario.
 *             example:
 *               nombre: Maxi
 *               apellido: Luna
 *               cuil: 20431877008
 *               email: maxiluna@example.com
 *               password: Maxi12345
 *               telefono: 123456789
 *               cargo: Profesor
 *     responses:
 *       201:
 *         description: Registro exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *               example:
 *                 ok: true
 *       400:
 *         description: Error de registro debido a datos duplicados o inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Ya existe este usuario
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Error de servidor
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Desconectar al usuario y eliminar la cookie de refreshToken.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Desconexión exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *               example:
 *                 ok: true
 */

/**
 * @swagger
 * /api/v1/auth/protected:
 *   get:
 *     summary: Ruta protegida que requiere un token de acceso válido.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso autorizado.
 *       401:
 *         description: Acceso no autorizado (token inválido o expirado).
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   get:
 *     summary: Refrescar el token de autenticación.
 *     tags: [Auth]
 *     description: Refrescar el token de autenticación a partir de un Refresh Token válido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token de autenticación refrescado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: El nuevo token de autenticación generado.
 *                 expiresIn:
 *                   type: integer
 *                   description: El tiempo en segundos en el que el nuevo token expirará.
 *                 id:
 *                   type: string
 *                   description: El ID del usuario cuyo token se está refrescando.
 *                 cuil:
 *                   type: string
 *                   description: El CUIL del usuario cuyo token se está refrescando.
 *                 roles:
 *                   type: array
 *                   description: Los roles del usuario cuyo token se está refrescando.
 *                   items:
 *                     type: string
 *       500:
 *         description: Error de servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error que indica un problema en el servidor.
 */
/**
 * @swagger
 * /api/v1/auth/confirmar/:token:
 *   get:
 *     summary: Confirmar cuenta de correo electrónico.
 *     tags: [Auth]
 *     description: Confirma la cuenta de correo electrónico de un usuario utilizando un token de confirmación.
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de confirmación enviado al correo electrónico del usuario.
 *     responses:
 *       200:
 *         description: Cuenta de correo electrónico confirmada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Mensaje de confirmación exitosa.
 *       500:
 *         description: Error de servidor al procesar la solicitud.
 */

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Restablecer la contraseña del usuario.
 *     tags: [Auth]
 *     description: Restablecer la contraseña del usuario utilizando un token de recuperación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: El token de recuperación enviado al correo del usuario.
 *               nuevaContrasena:
 *                 type: string
 *                 description: La nueva contraseña que se asignará al usuario.
 *             example:
 *               token: "abc123"
 *               nuevaContrasena: "NuevaContrasena123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito que indica que la contraseña se restableció con éxito.
 *       400:
 *         description: Token de recuperación inválido o error en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error que indica que el token de recuperación es inválido o que ocurrió un error en la solicitud.
 *       500:
 *         description: Error de servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error que indica un problema en el servidor.
 */

/**
 * @swagger
 * /api/v1/auth/recuperar-contrasena:
 *   post:
 *     summary: Solicitar recuperación de contraseña.
 *     tags: [Auth]
 *     description: Enviar una solicitud de recuperación de contraseña a través de correo electrónico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuil:
 *                 type: string
 *                 description: El CUIL del usuario para el cual se solicita la recuperación de contraseña.
 *             example:
 *               cuil: "20431877002"
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito que indica que se envió un correo de recuperación.
 *                 token:
 *                   type: string
 *                   description: El token de recuperación generado.
 *                 expiresIn:
 *                   type: string
 *                   description: La fecha de vencimiento del token de recuperación.
 *       400:
 *         description: Usuario no encontrado o error en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error que indica que el usuario no fue encontrado o que ocurrió un error en la solicitud.
 *       500:
 *         description: Error de servidor al procesar la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error que indica un problema en el servidor.
 */

/**
 * @swagger
 * /api/v1/auth/prueba:
 *   get:
 *     summary: Ruta de prueba protegida que requiere un token de acceso válido.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso autorizado.
 *       401:
 *         description: Acceso no autorizado (token inválido o expirado).
 *       500:
 *         description: Error interno del servidor.
 */


/**
 * @swagger
 * /api/v1/auth/alta:
 *   post:
 *     summary: Dar de alta usuarios
 *     description: Dar de alta usuarios pendientes y enviar correos de notificación.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               usuarios: ["64fd28b1ce385972c9d23b15", "64fd28b1ce385972c9d23b16"]
 *     responses:
 *       200:
 *         description: Éxito. Se han enviado los correos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 responseMessage:
 *                   type: string
 *                   example: "Se han enviado todos los emails correctamente"
 *       401:
 *         description: Error. No existe el usuario ingresado o el docente asociado al usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No existe el usuario ingresado"
 *       403:
 *         description: Error. Este usuario ya ha sido dado de alta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Este usuario ya ha sido dado de alta"
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error de servidor"
 */


/**
 * @swagger
 * /api/v1/auth/pendientes:
 *   get:
 *     summary: Consultar usuarios pendientes
 *     description: Consulta y devuelve usuarios pendientes sin ciertos atributos confidenciales.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Éxito. Se han consultado usuarios pendientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       cuil:
 *                         type: string
 *                       email:
 *                         type: string
 *                       datos_docente:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                           apellido:
 *                             type: string
 *                           telefono:
 *                             type: string
 *                           cargo:
 *                             type: string
 *             example:
 *               usuarios:
 *                 - id: "64fd28b1ce385972c9d23b15"
 *                   cuil: "20431877001"
 *                   email: "maximilianoluna3645@gmail.com"
 *                   datos_docente:
 *                     nombre: "Usuario"
 *                     apellido: "Responsable"
 *                     telefono: "351511233"
 *                     cargo: "Responsable"
 *                     id: "64fd28b1ce385972c9d23b16"
 *       204:
 *         description: No se han encontrado usuarios pendientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se han encontrado usuarios pendientes"
 *       500:
 *         description: Error de servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error de servidor"
 */
