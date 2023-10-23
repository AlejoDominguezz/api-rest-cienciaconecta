import { getFeriaActivaFuncion } from "../controllers/ferias.controller.js";

export const fecha = (fechaInicio, fechaFin) => {
    return async (req, res, next) => {
      try {

        // BYPASS --------------------------------
        return next()
        // BYPASS --------------------------------

        const fechaActual = Date.now();
  
        const feriaActiva = await getFeriaActivaFuncion();
        if (!feriaActiva) {
          return res.status(404).json({ error: "No existe una feria activa en este momento" });
        }
  
        if (
          feriaActiva[fechaInicio].getTime() <= fechaActual &&
          feriaActiva[fechaFin].getTime() >= fechaActual
        ) {
          return next();
        }
  
        res.status(409).send({ error: "No puedes acceder a este endpoint en la fecha actual" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error de servidor" });
      }
    };
  };


  export const estado = (estados) => {
    return async (req, res, next) => {
      try {
        // BYPASS --------------------------------
        return next()
        // BYPASS --------------------------------
        const feriaActiva = await getFeriaActivaFuncion();
        if (!feriaActiva) {
          return res.status(404).json({ error: "No existe una feria activa en este momento" });
        }

        if (estados.some((estado) => estado == feriaActiva.estado)) {
          return next();
        } 
  
        return res.status(409).send({ error: "No puedes acceder a este endpoint en la fecha actual" });

      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error de servidor" });
      }
    };
  }