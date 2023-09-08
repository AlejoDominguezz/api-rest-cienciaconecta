/**
 * @swagger
 * tags:
 *   name: Evaluadores
 *   description: Operaciones relacionadas con los evaluadores
 */

import { Router } from "express";
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from "../middlewares/validar-roles.js";
import { roles } from "../helpers/roles.js";
import { postularEvaluador } from "../controllers/evaluadores.controller.js";
import { bodyPostularEvaluadorValidator } from "../middlewares/validationManagerEvaluador.js";

const routerEvaluadores = Router();

routerEvaluadores.post("/postular", requireToken, checkRolAuth([roles.admin, roles.docente]), bodyPostularEvaluadorValidator, postularEvaluador);
//routerEvaluadores.post("/seleccionar", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), seleccionarEvaluador);
//routerEvaluadores.get("/postulaciones", requireToken, checkRolAuth([roles.admin, roles.comAsesora]), getPostulaciones);

export default routerEvaluadores;




// DOCUMENTACION SWAGGER --------------------------------------------------------------------------------------

/**
 * @swagger
 * /api/evaluadores/postular:
 *   post:
 *     summary: Postular un evaluador
 *     tags: [Evaluadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 description: Lista de IDs de niveles a los que está asociado el evaluador.
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de categorías a las que está asociado el evaluador.
 *               sede:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de sedes en las cuales se quiere evaluar el evaluador.
 *               antecedentes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de años de las ferias en las que participó anteriormente.
 *     responses:
 *       '200':
 *         description: Evaluador postulado con éxito
 *       '401':
 *         description: No existe una feria activa en este momento o el usuario no es un docente
 *       '500':
 *         description: Error de servidor
 */