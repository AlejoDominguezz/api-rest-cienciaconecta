/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Operaciones relacionadas con las categorías
 */

import { Router } from 'express';
import { check } from 'express-validator';
import { getCategorias } from '../controllers/categorias.controller.js';

const routerCategorias = Router();

//obtener todas las categorias 
routerCategorias.get('/',  [] 
    , getCategorias)

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
 *     security:
 *       - bearerAuth: []
 */
