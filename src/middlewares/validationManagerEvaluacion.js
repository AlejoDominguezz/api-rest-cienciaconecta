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

      // Obtener todos los IDs de rubrica, criterio y opción de la feria activa
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

      // Validar cada elemento de la evaluación
      evaluacion.forEach((item) => {
        if (
          !rubricasIds.includes(item.rubricaId.toString()) ||
          !criteriosIds.includes(item.criterioId.toString()) ||
          !opcionesIds.includes(item.opcionSeleccionada.toString())
        ) {
          throw new Error('Al menos uno de los IDs en la evaluación no existe en la feria activa');
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

    validarCampos
]


// CAMBIAR