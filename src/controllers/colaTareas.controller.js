import { fileCola, fileUpdateCola, emailCola } from "../helpers/queueManager.js";

export const obtenerEstadoCargaArchivos = async (req, res) => {

const idProyecto = req.params.idProyecto;

  try {
    const enCola = await fileCola.getJobs(['waiting', 'active'], 0, -1, 'asc');
    const enProgreso = enCola.filter(job => job.data.id_proyecto === idProyecto);
    const completados = await fileCola.getJobs(['completed'], 0, -1, 'desc', { id_proyecto: idProyecto });
    const fallidos = await fileCola.getFailed();

    const estado = {
      enCola: enCola.filter(job => job.data.id_proyecto === idProyecto),
      enProgreso: enProgreso,
      completados: completados,
      fallidos: fallidos.filter(job => job.data.id_proyecto === idProyecto),
    };

    return res.json(estado);

  } catch (error) {
    console.error('Error al consultar el estado de las tareas de carga de archivos', error);
    res.status(500).json({ error: 'Error al consultar el estado de las tareas de carga de archivos' });
  }
};