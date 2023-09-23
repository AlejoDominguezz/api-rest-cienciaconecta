import { body } from 'express-validator';
import { validarCampos } from './validar-campos.js';
import { getSedesRegionalesActualesFunction } from "../controllers/establecimientos.controller.js";
import { Referente } from '../models/Referente.js';

export const seleccionarReferentesValidator = [
  body('seleccion')
    .isArray()
    .withMessage('La selección debe ser un arreglo')
    .custom(async (seleccion, { req }) => {
        const sedes = await getSedesRegionalesActualesFunction(); // Obtener las sedes de la feria actual
  
        if (!seleccion || seleccion.length === 0) {
          throw new Error('Debes enviar un array de docentes seleccionados como referentes, indicando la sede');
        }
  
        const sedesDisponibles = sedes.sedes.map(sede => sede._id.toString());
  
        // Validar que cada objeto tenga una sede diferente
        const sedesElegidas = new Set();
  
        // Crear un conjunto para rastrear referentes seleccionados
        const referentesElegidos = new Set();
  
        // Validar cada objeto en 'seleccion'
        for (const obj of seleccion) {
          if (!sedesDisponibles.includes(obj.sede.toString())) {
            throw new Error(`${obj.sede} no es una sede de la Feria activa`);
          }
  
          // Validar si ya se ha elegido referente para esa sede
          if (sedesElegidas.has(obj.sede.toString())) {
            throw new Error(`No puedes indicar dos referentes para la misma sede`);
          }

          // Verificar si el mismo referente ya ha sido seleccionado
          if (referentesElegidos.has(obj.referente.toString())) {
            throw new Error(`El mismo referente no puede ser seleccionado para dos sedes distintas`);
          }
  
          // Agregar la sede actual al conjunto de sedes elegidas
          sedesElegidas.add(obj.sede.toString());
  
          // Verificar si el mismo referente ya ha sido seleccionado para la misma feria
          const referenteExistente = await Referente.findOne({
            idDocente: obj.referente,
            feria: obj.feria,
          });
  
          if (referenteExistente) {
            throw new Error(`El mismo referente no puede ser seleccionado para la misma feria en múltiples sedes`);
          }
  
          // Agregar el referente actual al conjunto de referentes elegidos
          referentesElegidos.add(obj.referente.toString());
        }
  
        return true;
      }),
  
    
  validarCampos
];