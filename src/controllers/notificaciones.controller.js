import mongoose from "mongoose";
import { Notificacion, estadoNotificacion } from "../models/Notificacion.js";

export const getNotificacionesNuevas = async (req, res) => {
    try {

        const uid = req.uid;
        const notificacion = await Notificacion.findOne({id_usuario: uid})
        if(!notificacion){
            return res.status(200).json({notificacionesNuevas: [], notificacionesNoLeidas: 0});
        }

        const notificacionesNuevas = notificacion.notificaciones.filter(
            (notificacion) => notificacion.estado == estadoNotificacion.creada
        );

        const notificacionesNoLeidas = notificacion.notificaciones.filter(
            (notificacion) => (notificacion.estado == estadoNotificacion.creada || notificacion.estado == estadoNotificacion.enviada)
        );

        const cantNotificacionesNoLeidas = notificacionesNoLeidas.length;

        if(notificacionesNuevas.length == 0){
            return res.status(200).json({notificacionesNuevas: [], notificacionesNoLeidas: cantNotificacionesNoLeidas});
        }

        // Cambia el estado de las notificaciones a "enviada"
        notificacionesNuevas.map(async (notificacion) => {
            notificacion.estado = estadoNotificacion.enviada;
        })

        await notificacion.save();



        return res.json({notificacionesNuevas, notificacionesNoLeidas: cantNotificacionesNoLeidas})

    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }

}


export const getNotificaciones = async (req, res) => {
    try {
        const uid = req.uid;
        const notificacion = await Notificacion.findOne({id_usuario: uid})
            .select("-__v")
            .lean()
            .exec()

        if(!notificacion || notificacion.notificaciones.length == 0){
            return res.status(204).json({});
        }
        return res.json(notificacion.notificaciones)


    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }

}

export const notificacionesLeidas = async (req, res) => {
    try {
        const uid = req.uid;
        const leidas = req.body.leidas;
        const notificacion = await Notificacion.findOne({id_usuario: uid})
        if (!notificacion) {
            return res.status(404).json({ error: 'Notificaciones no encontradas para el usuario' });
        }

        notificacion.notificaciones.forEach(notif => {
            if (leidas.includes(notif._id.toString())) {
                notif.estado = estadoNotificacion.leida;
            }
        });

        await notificacion.save();
        return res.json({msg: "Se han marcado todas las notificaciones como leídas"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error de servidor" });
    }

}