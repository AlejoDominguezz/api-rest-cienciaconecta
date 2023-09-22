import { body, validationResult } from 'express-validator';
import { getFeriaActivaFuncion } from '../controllers/ferias.controller.js'; 
import { validarCampos } from './validar-campos.js';

export const evaluacionValidator = [
  body('evaluacion')
    .isArray()
    .withMessage('La evaluación debe ser un arreglo')
    .custom(async (evaluacion, { req }) => {
      // Verificar si la feria activa tiene criterios de evaluación
      const feriaActiva = await getFeriaActivaFuncion(); // Asegúrate de que esta función obtenga la feria activa correctamente

      if (!feriaActiva || !feriaActiva.criteriosEvaluacion) {
        throw new Error('No se encontraron criterios de evaluación en la feria activa');
      }

      //Obtener todos los IDs de rubrica, criterio y opción de la feria activa
      const rubricasIds = [];
      const criteriosIds = [];
      const opcionesIds = [];

      feriaActiva.criteriosEvaluacion.forEach((rubrica) => {
        rubricasIds.push(rubrica._id.toString());
        rubrica.criterios.forEach((criterio) => {
          criteriosIds.push(criterio._id.toString());
          criterio.opciones.forEach((opcion) => {
            opcionesIds.push(opcion._id.toString());
          });
        });
      });

      // // Validar cada elemento de la evaluación
      // evaluacion.forEach((item) => {
      //   if (
      //     !rubricasIds.includes(item.rubricaId.toString()) ||
      //     !criteriosIds.includes(item.criterioId.toString()) ||
      //     !opcionesIds.includes(item.opcionSeleccionada.toString())
      //   ) {
      //     throw new Error('Al menos uno de los IDs en la evaluación no existe en la feria activa');
      //   }
      // });

      // Validar cada elemento de la evaluación
      evaluacion.forEach((item) => {
        const rubricaEncontrada = feriaActiva.criteriosEvaluacion.find((rubrica) => rubrica._id.toString() === item.rubricaId.toString());

        if (!rubricaEncontrada) {
          throw new Error(`Rubrica con ID ${item.rubricaId} no encontrada en la feria activa`);
        }

        const criterioEncontrado = rubricaEncontrada.criterios.find((criterio) => criterio._id.toString() === item.criterioId.toString());

        if (!criterioEncontrado) {
          throw new Error(`Criterio con ID ${item.criterioId} no encontrado en la rubrica con ID ${item.rubricaId}`);
        }

        const opcionEncontrada = criterioEncontrado.opciones.find((opcion) => opcion._id.toString() === item.opcionSeleccionada.toString());

        if (!opcionEncontrada) {
          throw new Error(`Opción con ID ${item.opcionSeleccionada} no encontrada en el criterio con ID ${item.criterioId}`);
        }
      });

      // Verificar que no existan dos elementos de evaluación con los mismos IDs de criterio y rubrica
      const uniqueElements = new Set();
      evaluacion.forEach((item) => {
        const elementKey = `${item.rubricaId}-${item.criterioId}`;
        if (uniqueElements.has(elementKey)) {
          throw new Error('No pueden existir dos elementos de evaluación con los mismos IDs de criterio y rubrica');
        }
        uniqueElements.add(elementKey);
      });

      return true;
    }),

  body('comentarios')
    .isArray()
    .withMessage('Los comentarios deben ser un arreglo')
    .optional(),

  body('comentarios.*.rubricaId')
    .custom(async (rubricaId, { req }) => {
      const feriaActiva = await getFeriaActivaFuncion(); // Asegúrate de que esta función obtenga la feria activa correctamente

      if (!feriaActiva || !feriaActiva.criteriosEvaluacion) {
        throw new Error('No se encontraron criterios de evaluación en la feria activa');
      }

      // Verificar si el rubricaId existe en la feria activa
      const rubricaExists = feriaActiva.criteriosEvaluacion.some((rubrica) =>
        rubrica._id.toString() === rubricaId.toString()
      );

      if (!rubricaExists) {
        throw new Error('El rubricaId en los comentarios no existe en la feria activa');
      }

      return true;
    }),

  body('comentarios.*.comentario')
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede exceder los 1000 caracteres')
    .notEmpty()
    .withMessage('El comentario no puede estar vacío'),



    validarCampos
]

