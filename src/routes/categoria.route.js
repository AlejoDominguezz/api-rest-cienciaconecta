/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Operaciones relacionadas con las categorías
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { crearCategoria, eliminarCategoria, getCategorias } from '../controllers/categorias.controller.js';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { crearCategoriaValidator, eliminarCategoriaValidator } from '../middlewares/validationManagerCategoria.js';

const routerCategorias = Router();

//obtener todas las categorias 
routerCategorias.get('/',  requireToken, checkRolAuth([roles.admin, roles.comAsesora, roles.docente, roles.refEvaluador, roles.evaluador, roles.responsableProyecto]) , getCategorias)
routerCategorias.post('/',  requireToken, checkRolAuth([roles.admin, roles.comAsesora]) , crearCategoriaValidator, crearCategoria)
routerCategorias.delete('/:id',  requireToken, checkRolAuth([roles.admin, roles.comAsesora]) , eliminarCategoriaValidator, eliminarCategoria)

export default routerCategorias;



/**
 * @swagger
 * /api/v1/categoria:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categorias]
 *     responses:
 *       '200':
 *         description: Lista de todas las categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoria:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Categoria'
 *       '500':
 *         description: Error de servidor
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/v1/categoria:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoría con una longitud máxima de 150 caracteres
 *               abreviatura:
 *                 type: string
 *                 description: Abreviatura de la categoría con una longitud máxima de 12 caracteres
 *               color:
 *                 type: string
 *                 description: Color de la categoría con formato hexadecimal ("#123456")
 *     responses:
 *       '200':
 *         description: La categoría se ha creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       '500':
 *         description: Error de servidor
 */



/**
 * @swagger
 * /api/v1/categoria/:id:
 *   delete:
 *     summary: Eliminar una categoría por su ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la categoría a eliminar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: La categoría se ha eliminado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       '404':
 *         description: No se ha encontrado ninguna categoría con el ID ingresado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Error de servidor
 */