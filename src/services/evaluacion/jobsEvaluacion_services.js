import { addHours } from "date-fns";
import { evaluacionCola } from "../../helpers/queueManager.js"

export const crearJobsEvaluacion = async (tipo, feria_id, proyecto_id) => {

    // Obtener Jobs a cancelar, en caso de que ya exista una tarea programada al iniciar la evaluación
    const jobs = await evaluacionCola.getDelayed(); // Obtener las tareas programadas
    const jobToCancel = jobs.find((job) => (job.data.feria_id.toString() == feria_id.toString()) 
                        && (job.name.toString() == `evaluacion:${tipo}`) 
                        && (job.data.proyecto_id.toString() == proyecto_id.toString()));

    if (jobToCancel) {
        await jobToCancel.remove();
        console.log('Tarea existente cancelada - ', `evaluacion:${tipo}`);
    }

    const retrasoEnMilisegundos = 3 * 60 * 60 * 1000; // 3 Horas
    evaluacionCola.add(`evaluacion:${tipo}`, { feria_id, proyecto_id }, { delay: retrasoEnMilisegundos });
}

export const cancelarJobsEvaluacion = async (tipo, feria_id, proyecto_id) => {
    // Obtener Jobs a cancelar 
    const jobs = await evaluacionCola.getDelayed(); // Obtener las tareas programadas
    const jobToCancel = jobs.find((job) => (job.data.feria_id.toString() == feria_id.toString()) 
                        && (job.name.toString() == `evaluacion:${tipo}`) 
                        && (job.data.proyecto_id.toString() == proyecto_id.toString()));

    if (jobToCancel) {
        await jobToCancel.remove();
        console.log('Tarea existente cancelada - ', `evaluacion:${tipo}`);
    } else {
        console.log('No se encontró ninguna tarea existente para cancelar - ', `evaluacion:${tipo}`);
    }
}