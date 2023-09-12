import { getFeriaActivaFuncion } from "../controllers/ferias.controller.js";

export const fecha = (fechaInicio, fechaFin) => {
    return async (req, res, next) => {
      try {
        const fechaActual = Date.now();
  
        const feriaActiva = await getFeriaActivaFuncion();
        if (!feriaActiva) {
          return res.status(401).json({ error: "No existe una feria activa en este momento" });
        }
  
        if (
          feriaActiva[fechaInicio] <= fechaActual &&
          feriaActiva[fechaFin] >= fechaActual
        ) {
          return next();
        }
  
        res.status(401).send({ error: "No puedes acceder a este endpoint en la fecha actual" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error de servidor" });
      }
    };
  };