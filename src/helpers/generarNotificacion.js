import { Notificacion } from "../models/Notificacion.js"

export const generarNotificacion = async (usuario, mensaje) => {
    
    try {
        let notificacion = await Notificacion.findOne({id_usuario: usuario})
        if(notificacion){
            notificacion.notificaciones.push({
                mensaje: mensaje
            })
        } else {
            notificacion = new Notificacion({
                id_usuario: usuario,
                notificaciones: [{
                    mensaje: mensaje
                }]
            })
        }
        notificacion.save()
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}


export const tipo_notificacion = {
    postulacion: 'Te has postulado como Evaluador para la Feria actual. Pronto recibirás una respuesta.',
    seleccion: 'Te han seleccionado como Evaluador para la Feria actual. ¡Felicidades!',
    inscripcion: (titulo) => `Has inscripto el proyecto '${titulo}' en la Feria actual. ¡Mucha suerte!`,
    //promocion: (titulo, instancia) => `Tu proyecto '${titulo}' ha sido promovido a la instancia ${instancia}. ¡Felicidades!.`,
    //subir_documentos: (titulo) => `Tu proyecto '${titulo}' debe ser actualizado con los documentos correspondientes. Por favor, editá tu proyecto para actualizarlo.`,
    //no_promocion: (titulo) => `Tu proyecto '${titulo}' no ha sido promovido a la instancia ${instancia}. ¡Suerte para el próximo año!.`,
    //evaluacion_lista: (titulo) => `La evaluación del proyecto '${titulo}' ya está disponible.`
    asignacion: (titulo) => `Has sido asignado como evaluador del proyecto '${titulo}'.`,
    evaluacion_teorica_regional: (titulo) => `Has evaluado el proyecto '${titulo}' en la instancia regional (teórico).`,
    evaluacion_exposicion_regional: (titulo) => `Has evaluado el proyecto '${titulo}' en la instancia regional (exposición).`,
    evaluacion_exposicion_provincial: (titulo) => `Has evaluado el proyecto '${titulo}' en la instancia provincial (exposición).`,
    fin_evaluacion_teorica_regional: (titulo) => `La evaluación del proyecto '${titulo}' en instancia regional (teórica) ha finalizado.`,
    fin_evaluacion_exposicion_regional: (titulo) => `La evaluación del proyecto '${titulo}' en instancia regional (exposición) ha finalizado.`,
    fin_evaluacion_exposicion_provincial: (titulo) => `La evaluación del proyecto '${titulo}' en instancia provincial (exposición) ha finalizado.`,
    confirmar_evaluacion_teorica_regional: (titulo) => `Has confirmado la evaluación del proyecto '${titulo}' en la instancia regional (teórico).`, 
    confirmar_evaluacion_exposicion_regional: (titulo) => `Has confirmado la evaluación del proyecto '${titulo}'en la instancia regional (exposición).`,
    confirmar_evaluacion_exposicion_provincial: (titulo) => `Has confirmado la evaluación del proyecto '${titulo}'en la instancia provincial (exposición).`,
    quita_confirmado_evaluacion: (titulo) => `La evaluación del proyecto '${titulo}' que confirmaste anteriormente se ha modificado. Revisá la evaluación y confirmalo nuevamente.`,
    todos_evaluaron_exposicion_regional: (titulo) => `Todos los evaluadores han evaluado el proyecto '${titulo}' en la instancia regional (exposición). Ya podés confirmar la evaluación.`,
    todos_evaluaron_teorica_regional: (titulo) => `Todos los evaluadores han evaluado el proyecto '${titulo}' en la instancia regional (teórico). Ya podés confirmar la evaluación.`,
    todos_evaluaron_exposicion_provincial: (titulo) => `Todos los evaluadores han evaluado el proyecto '${titulo}' en la instancia provincial (exposición). Ya podés confirmar la evaluación.`,
    //inicio_evaluacion: (instancia) => `La evaluación de proyectos en la instancia ${instancia} ha comenzado. Ya puedes comenzar a evaluar tus proyectos asignados.`
    //5dias_evaluacion: `Sólo te quedan 5 días para completar la evaluación de tus proyectos.`
    //1dia_evaluacion: `Sólo te queda 1 día para completar la evaluación de tus proyectos.`
    //5dias_asignacion: (cantidad) =>`Sólo te quedan 5 días para asignar evaluadores a los proyectos de tu sede. Te quedan ${cantidad} proyectos por asignar.`
    //1dia_asignacion: (cantidad) =>`Sólo te queda 1 día para asignar evaluadores a los proyectos de tu sede. Te quedan ${cantidad} proyectos por asignar.`
    //inicio_asignacion: "Ya podés comenzar a asignar evaluadores a los proyectos de tu sede."
}