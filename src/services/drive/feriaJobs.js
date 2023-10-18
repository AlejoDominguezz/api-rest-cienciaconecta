import { feriaCola } from "../../helpers/queueManager.js"

// Función para generar tareas asincrónicas para la actualización de estados de Feria según las fechas ingredas ------------------------
export const generarJobsAsincronicos = async (feria_id, feria, body) => {

    // Fecha de inicio de Feria -----------------------------------------------------------------------------
    if(new Date(body.fechaInicioFeria).getTime() != new Date(feria?.fechaInicioFeria).getTime()){
  
      await cancelarJobs("inicioFeria", feria_id)
      const fecha = body.fechaInicioFeria;
      await generarJob(fecha, feria_id, "inicioFeria");
    }
  
  
    // Fecha de inicio de instancia escolar -----------------------------------------------------------------
    if(new Date(body.instancias.instanciaEscolar.fechaInicioInstancia).getTime() != new Date(feria?.instancias.instanciaEscolar.fechaInicioInstancia).getTime()){
      
      await cancelarJobs("inicioInstanciaEscolar", feria_id)
      const fecha = body.instancias.instanciaEscolar.fechaInicioInstancia;
      await generarJob(fecha, feria_id, "inicioInstanciaEscolar");
    }
  
    // Fecha de fin de instancia escolar -----------------------------------------------------------------
    if(new Date(body.instancias.instanciaEscolar.fechaFinInstancia).getTime() != new Date(feria?.instancias.instanciaEscolar.fechaFinInstancia).getTime()){
      
      await cancelarJobs("finInstanciaEscolar", feria_id)
      const fecha = body.instancias.instanciaEscolar.fechaFinInstancia;
      await generarJob(fecha, feria_id, "finInstanciaEscolar");
    }

    
    // Fecha de inicio de evaluación regional -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica).getTime() != new Date(feria?.instancias.instanciaRegional.fechaInicioEvaluacionTeorica).getTime()){
      
        await cancelarJobs("inicioEvaluacionRegional", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaInicioEvaluacionTeorica;
        await generarJob(fecha, feria_id, "inicioEvaluacionRegional");
    }

    // Fecha de fin de evaluación regional -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaFinEvaluacionTeorica).getTime() != new Date(feria?.instancias.instanciaRegional.fechaFinEvaluacionTeorica).getTime()){
      
        await cancelarJobs("finEvaluacionRegional", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
        await generarJob(fecha, feria_id, "finEvaluacionRegional");
    }

    // Fecha de inicio de exposición regional -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaInicioEvaluacionPresencial).getTime() != new Date(feria?.instancias.instanciaRegional.fechaInicioEvaluacionPresencial).getTime()){
      
        await cancelarJobs("inicioExposicionRegional", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaInicioEvaluacionPresencial;
        await generarJob(fecha, feria_id, "inicioExposicionRegional");
    }

    // Fecha de fin de exposición regional -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaFinEvaluacionPresencial).getTime() != new Date(feria?.instancias.instanciaRegional.fechaFinEvaluacionPresencial).getTime()){
      
        await cancelarJobs("finExposicionRegional", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaFinEvaluacionPresencial;
        await generarJob(fecha, feria_id, "finExposicionRegional");
    }

    // Fecha de promoción de proyectos a instancia provincial ----------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaPromocionAProvincial).getTime() != new Date(feria?.instancias.instanciaRegional.fechaPromocionAProvincial).getTime()){
      
        await cancelarJobs("promovidosAProvincial", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaPromocionAProvincial;
        await generarJob(fecha, feria_id, "promovidosAProvincial");
    }

    // Fecha de inicio de exposición provincial -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial).getTime() != new Date(feria?.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial).getTime()){
      
        await cancelarJobs("inicioExposicionProvincial", feria_id)
        const fecha = body.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial;
        await generarJob(fecha, feria_id, "inicioExposicionProvincial");
    }

    // Fecha de fin de exposición provincial -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial).getTime() != new Date(feria?.instancias.instanciaProvincial.fechaFinEvaluacionPresencial).getTime()){
      
        await cancelarJobs("finExposicionProvincial", feria_id)
        const fecha = body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial;
        await generarJob(fecha, feria_id, "finExposicionProvincial");
    }

    // Fecha de promoción de proyectos a instancia nacional ----------------------------------------------------------------
    if(new Date(body.instancias.instanciaProvincial.fechaPromocionANacional).getTime() != new Date(feria?.instancias.instanciaProvincial.fechaPromocionANacional).getTime()){
      
        await cancelarJobs("promovidosANacional", feria_id)
        const fecha = body.instancias.instanciaProvincial.fechaPromocionANacional;
        await generarJob(fecha, feria_id, "promovidosANacional");
    }

    // Fecha de fin de Feria -----------------------------------------------------------------------------
    if(new Date(body.fechaFinFeria).getTime() != new Date(feria?.fechaFinFeria).getTime()){
      
        await cancelarJobs("finFeria", feria_id)
        const fecha = body.fechaFinFeria;
        await generarJob(fecha, feria_id, "finFeria");
    }
  
  } 
  
  
const generarJob = async (fecha_original, feria_id, tipo) => {
    const fecha = new Date(fecha_original);
    const delay = fecha.getTime() - Date.now();
    await feriaCola.add(`feria:${tipo}`, { fecha, feria_id }, { delay });
}
  
  
const cancelarJobs = async (tipo, feria_id) => {
  
    // Obtener Jobs a cancelar 
    const jobs = await feriaCola.getDelayed(); // Obtener las tareas programadas
    const jobToCancel = jobs.find((job) => (job.data.feria_id.toString() === feria_id.toString()) && (job.name.toString() === `feria:${tipo}`));
    if (jobToCancel) {
        await jobToCancel.remove();
        console.log('Tarea existente cancelada - ', `feria:${tipo}`);
    } else {
        console.log('No se encontró ninguna tarea existente para cancelar - ', `feria:${tipo}`);
    }
}