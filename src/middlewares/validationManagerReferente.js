import { body } from 'express-validator';
import { validarCampos } from './validar-campos.js';
import { getSedesRegionalesActualesFunction } from "../controllers/establecimientos.controller.js";
import { Referente } from '../models/Referente.js';
import { getFeriaActivaFuncion } from '../controllers/ferias.controller.js';
import { Types } from 'mongoose';

export const seleccionarReferentesValidator = [

  body('seleccion.*.referente')
    .optional({ nullable: true }) 
    .isMongoId()
    .withMessage("El Referente ingresado no es un Mongo ID válido"),

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

          if(obj.referente){
            // Verificar si el mismo referente ya ha sido seleccionado
            if (referentesElegidos.has(obj.referente.toString())) {
              throw new Error(`El mismo referente no puede ser seleccionado para dos sedes distintas`);
            }
          }
          
  
          // Agregar la sede actual al conjunto de sedes elegidas
          sedesElegidas.add(obj.sede.toString());
  
          // Agregar el referente actual al conjunto de referentes elegidos

          if(obj.referente){
            referentesElegidos.add(obj.referente.toString());
          }
        }
  
        return true;
      }),
  
    
  validarCampos
];




export const asignarEvaluadorValidator = [
  body('evaluadores')
    .isArray()
    .withMessage('El atributo evaluadores debe ser un Array')
    .custom((value) => {
      // Verificar que el array no tenga más de 3 elementos
      if (value.length > 3) {
        throw new Error('El array evaluadores no puede tener más de 3 elementos');
      }
      return true;
    })
    // .custom((value) => {
    //   // Verificar que el array tenga al menos un elemento
    //   if (!Array.isArray(value) || value.length === 0) {
    //     throw new Error('El array evaluadores debe contener al menos un elemento');
    //   }
    //   return true;
    // })
    .custom((value) => {
      // Validar cada elemento del array como un Mongo ID
      if (value.some((element) => !Types.ObjectId.isValid(element))) {
        throw new Error('Al menos uno de los elementos en evaluadores no es un Mongo ID válido');
      }
      return true;
    })
    .custom((value) => {
      // Validar que no haya IDs repetidos en el array
      const uniqueIDs = new Set(value);
      if (uniqueIDs.size !== value.length) {
        throw new Error('El array evaluadores no debe contener IDs repetidos');
      }
      return true;
    }),
  validarCampos
];

// export const desasignarEvaluadorValidator = [
//   body('evaluador')
//     .isMongoId()
//     .withMessage('El atributo evaluador debe ser un Mongo ID válido'),
    
//   validarCampos
// ];