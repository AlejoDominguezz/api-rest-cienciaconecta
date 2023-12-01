import { establecimientosCola } from "../helpers/queueManager.js";

export const verificarTareaActiva = async (req, res, next) => {
  try {
    // Verificar si hay tareas activas en la cola
    const tareasActivas = await establecimientosCola.getActiveCount();

    if (tareasActivas > 0) {
      return res.status(400).json({ error: 'Ya hay una tarea de actualización en progreso' });
    }

    // Si no hay tareas activas, permitir que la solicitud continúe
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al verificar tareas activas' });
  }
};