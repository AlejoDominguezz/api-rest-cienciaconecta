/**
 * @swagger
 * tags:
 *   name: Niveles
 *   description: Operaciones relacionadas con los niveles educativos. Sin validaciones de estados de feria.
 */

import { Router } from 'express';
import { check } from 'express-validator';
import {getNiveles} from '../controllers/niveles.controller.js';


const routerNiveles = Router();

//obtener todas las ferias 
routerNiveles.get('/',  [] 
    , getNiveles)



export default routerNiveles;

/**
 * @swagger
 * /api/v1/nivel:
 *   get:
 *     summary: Obtener todos los niveles educativos
 *     tags: [Niveles]
 *     responses:
 *       '200':
 *         description: Lista de todos los niveles educativos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 niveles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Nivel'
 *       '500':
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 *       - roles: [admin, comAsesora]
 */