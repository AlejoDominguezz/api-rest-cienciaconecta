import { filesCola } from "../helpers/queueManager.js";

export const obtenerEstadoCargaArchivos = async (req, res) => {
  const idProyecto = req.params.idProyecto;

  try {
    const enCola = await filesCola.getJobs(['waiting', 'active'], 0, -1, 'asc');
    const enProgreso = enCola.filter(job => job.data.id_proyecto === idProyecto || job.data.id === idProyecto);
    const completados = await filesCola.getJobs(['completed'], 0, -1, 'desc', {
      $or: [{ id_proyecto: idProyecto }, { id: idProyecto }],
    });
    const fallidos = await filesCola.getFailed();

    const estado = {
      enCola: enCola.filter(job => job.data.id_proyecto === idProyecto || job.data.id === idProyecto),
      enProgreso: enProgreso,
      completados: completados,
      fallidos: fallidos.filter(job => job.data.id_proyecto === idProyecto || job.data.id === idProyecto),
    };

    return res.json(estado);

  } catch (error) {
    console.error('Error al consultar el estado de las tareas de carga de archivos', error);
    res.status(500).json({ error: 'Error al consultar el estado de las tareas de carga de archivos' });
  }
};
