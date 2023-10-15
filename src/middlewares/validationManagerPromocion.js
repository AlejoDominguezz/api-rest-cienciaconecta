import { checkEstablecimientoIsSede } from "../controllers/establecimientos.controller.js";
import { Evaluacion, estadoEvaluacion } from "../models/Evaluacion.js";
import { EvaluacionExposicion, estadoEvaluacionExposicion } from "../models/EvaluacionExposicion.js";
import { Nivel } from "../models/Nivel.js";
import { Proyecto } from "../models/Proyecto.js";
import { validarCampos } from "./validar-campos.js";
import { body } from 'express-validator';
import { Types } from 'mongoose';

export const promoverProvincialValidator = [
    body('proyectos')
        .isArray()
        .withMessage('El atributo "proyectos" debe ser un Array'),

    body('proyectos.*')
        .isMongoId()
        .withMessage('El atributo "proyectos" debe contener IDs de Mongo válidos')
        .custom(async (value, { req }) => {
            const proyecto = await Proyecto.findById(value);
        
            if (!proyecto) {
              throw new Error(`No se encontró un proyecto con el ID ${value}`);
            }
        
            if (proyecto.nivel.toString() !== req.body.nivel) {
              throw new Error(`El nivel del proyecto ${value} no coincide con el nivel proporcionado`);
            }
        
            if (proyecto.sede.toString() !== req.body.sede) {
              throw new Error(`La sede del proyecto ${value} no coincide con la sede proporcionada`);
            }
        
            return true;
          }),
        
        //COMPLETAR ----------------------------


    // Validación de Nivel
    body('nivel')
        .isMongoId()
        .withMessage('El nivel ingresado no es un ID de Mongo válido')
        .custom(async (nivelId) => {
            if (!Types.ObjectId.isValid(nivelId)) {
              throw new Error('El nivel ingresado no es un ID de Mongo válido');
            }
        
            const nivel = await Nivel.findOne({ _id: nivelId });
        
            if (!nivel) {
              throw new Error('No existe el Nivel con el ID ingresado');
            }
        
            return true; 
          }),

    // Validación de Sede
    body('sede')
        .isMongoId()
        .withMessage('La sede ingresada no es un ID de Mongo válido')
        .custom(async (value) => {

            const isSedeValid = await checkEstablecimientoIsSede(value);
    
            if (!isSedeValid) {
            throw new Error('El establecimiento elegido no es una sede actual');
            }
    
          })
        .withMessage('El establecimiento elegido no es una sede actual'),

    validarCampos
  ];






  export const obtenerProvincialValidator = [

    // Validación de Nivel
    body('nivel')
    .isMongoId()
    .withMessage('El nivel ingresado no es un ID de Mongo válido')
    .custom(async (nivelId) => {
        if (!Types.ObjectId.isValid(nivelId)) {
            throw new Error('El nivel ingresado no es un ID de Mongo válido');
        }
    
        const nivel = await Nivel.findOne({ _id: nivelId });
    
        if (!nivel) {
            throw new Error('No existe el Nivel con el ID ingresado');
        }
    
        return true; 
        }),

        
    // Validación de Sede
    body('sede')
        .isMongoId()
        .withMessage('La sede ingresada no es un ID de Mongo válido')
        .custom(async (value) => {

            const isSedeValid = await checkEstablecimientoIsSede(value);
    
            if (!isSedeValid) {
            throw new Error('El establecimiento elegido no es una sede actual');
            }
    
          })
        .withMessage('El establecimiento elegido no es una sede actual'),

    validarCampos
  ];