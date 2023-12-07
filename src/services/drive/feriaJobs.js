import { subDays } from "date-fns";
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
    // Los proyectos cuyos documentos no se cargaron, se finalizan automáticamente

    // Fecha de fin de evaluación regional -----------------------------------------------------------------------------
    if(new Date(body.instancias.instanciaRegional.fechaFinEvaluacionTeorica).getTime() != new Date(feria?.instancias.instanciaRegional.fechaFinEvaluacionTeorica).getTime()){
      
        await cancelarJobs("finEvaluacionRegional", feria_id)
        const fecha = body.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
        await generarJob(fecha, feria_id, "finEvaluacionRegional");

        await cancelarJobs("cinco_dias_finEvaluacionRegional", feria_id)
        const fechaA = body.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
        await generarJobDias(fechaA, feria_id, "cinco_dias_finEvaluacionRegional", 5);

        await cancelarJobs("un_dia_finEvaluacionRegional", feria_id)
        const fechaB = body.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
        await generarJobDias(fechaB, feria_id, "un_dia_finEvaluacionRegional", 1);
    }
    // Los proyectos no evaluados, se generan con puntaje 0. Si se evaluaron, se cierra la evaluación, si estaba abierta

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

        await cancelarJobs("cinco_dias_finExposicionRegional", feria_id)
        const fechaA = body.instancias.instanciaRegional.fechaFinEvaluacionPresencial;
        await generarJobDias(fechaA, feria_id, "cinco_dias_finExposicionRegional", 5);

        await cancelarJobs("un_dia_finExposicionRegional", feria_id)
        const fechaB = body.instancias.instanciaRegional.fechaFinEvaluacionPresencial;
        await generarJobDias(fechaB, feria_id, "un_dia_finExposicionRegional", 1);
    }
    // Los proyectos no evaluados, se generan con puntaje 0. Si se evaluaron, se cierra la evaluación, si estaba abierta

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

        await cancelarJobs("cinco_dias_finExposicionProvincial", feria_id)
        const fechaA = body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial;
        await generarJobDias(fechaA, feria_id, "cinco_dias_finExposicionProvincial", 5);

        await cancelarJobs("un_dia_finExposicionProvincial", feria_id)
        const fechaB = body.instancias.instanciaProvincial.fechaFinEvaluacionPresencial;
        await generarJobDias(fechaB, feria_id, "un_dia_finExposicionProvincial", 1);
    }
    // Los proyectos no evaluados, se generan con puntaje 0. Si se evaluaron, se cierra la evaluación, si estaba abierta

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
        // Al finalizar la feria, se eliminan los roles de todos los usuarios, excepto roles: admin, comAsesora, docente.
    }

    // Fecha de inicio de asignación -----------------------------------------------------------------------------
    if(new Date(body.fechaInicioAsignacionProyectos).getTime() != new Date(feria?.fechaInicioAsignacionProyectos).getTime()){
    
        await cancelarJobs("inicioAsignacion", feria_id)
        const fecha = body.fechaInicioAsignacionProyectos;
        await generarJob(fecha, feria_id, "inicioAsignacion");
    }

    // Fecha de fin de asignación -----------------------------------------------------------------------------
    if(new Date(body.fechaFinAsignacionProyectos).getTime() != new Date(feria?.fechaFinAsignacionProyectos).getTime()){

        await cancelarJobs("cinco_dias_finAsignacion", feria_id)
        const fechaA = body.fechaFinAsignacionProyectos;
        await generarJobDias(fechaA, feria_id, "cinco_dias_finAsignacion", 5);

        await cancelarJobs("un_dia_finAsignacion", feria_id)
        const fechaB = body.fechaFinAsignacionProyectos;
        await generarJobDias(fechaB, feria_id, "un_dia_finAsignacion", 1);
    }
  
  } 
  

const generarJobDias = async (fecha_original, feria_id, tipo, dias) => {
    const fecha = subDays(new Date(fecha_original), dias);
    const delay = fecha.getTime() - Date.now();
    feriaCola.add(`feria:${tipo}`, { fecha, feria_id }, { delay });
}

  
const generarJob = async (fecha_original, feria_id, tipo) => {
    const fecha = new Date(fecha_original);
    const delay = fecha.getTime() - Date.now();
    feriaCola.add(`feria:${tipo}`, { fecha, feria_id }, { delay });
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