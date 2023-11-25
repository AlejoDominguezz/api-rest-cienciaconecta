import { Notificacion } from "../models/Notificacion.js"

export const generarNotificacion = async (usuario, mensaje) => {
    
    try {
        let notificacion = await Notificacion.findOne({id_usuario: usuario})
        if(notificacion){
            notificacion.notificaciones.push({
                mensaje: mensaje,
                timestamp: Date.now()
            })
        } else {
            notificacion = new Notificacion({
                id_usuario: usuario,
                notificaciones: [{
                    mensaje: mensaje,
                    timestamp: Date.now()
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
    referente_asignado: (sede) => `Fuiste asignado como referente de la sede ${sede}.`
}