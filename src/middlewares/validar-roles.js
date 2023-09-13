//logica de negocio para validar roles

import { Docente } from "../models/Docente.js";
import { Proyecto } from "../models/Proyecto.js";
import { roles } from "../helpers/roles.js";
import { Evaluador } from "../models/Evaluador.js";
import { Feria } from "../models/Feria.js";
import { esActiva } from "../controllers/ferias.controller.js"

export const checkRolAuth = (roles) => async (req, res, next) => {
  try {
    const rolesData = req.roles;

    if (rolesData.some((role) => roles.includes(role))) {
      next();
    } else {
      res.status(403).json({ error: "No tienes los permisos necesarios para realizar esta acción" });
    }
  } catch (error) {
    console.log(error);
    res.status(409);
    res.send({ error: "Error al comprobar permisos" });
  }
};

export const esPropietario = async (req, res, next) => {
  try {
    const idUsuario = req.uid;
    const { id } = req.params;
    const rolesData = req.roles;

    if (!rolesData.includes(roles.responsableProyecto)) {
      return next();
    }

    if (rolesData.includes(roles.admin)) {
      return next();
    }

    if (!id) {
      return res
        .status(400)
        .json({ error: "Se necesita pasar por parámetro el ID de proyecto" });
    }

    const proyecto = await Proyecto.findById(id);
    if (!proyecto)
      return res.status(404).json({ error: "No se ha encontrado el proyecto" });

    const docente = await Docente.findOne({ usuario: idUsuario });
    if (!docente)
      return res.status(404).json({ error: "No se ha encontrado el docente" });


    if (docente._id.toString() !== proyecto.idResponsable.toString()) {
      return res
        .status(403)
        .json({ error: "No eres propietario de este proyecto" });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(409).json({ error: "Error al comprobar el propietario" });
  }
};


export const esEvaluadorDelProyecto = async (req, res, next) => {
  
  try {
    const { id } =  req.params; // ID Proyecto
    const uid = req.uid;

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        return res.status(404).json({ error: "No existe el proyecto" });
    }

    const feria = await Feria.findById(proyecto.feria)
    if(!esActiva(feria)){
        return res.status(401).json({ error: "El proyecto tiene asignado una Feria que ya ha finalizado" });
    }

    const docente = await Docente.findOne({usuario: uid})
    if(!docente){
        return res.status(404).json({ error: "No existe el docente asociado al usuario" });
    }

    const evaluador = await Evaluador.findOne({idDocente: docente.id})
    if(!evaluador){
        return res.status(404).json({ error: "No existe el evaluador asociado al docente" });
    }

    if(!proyecto.evaluadoresRegionales.includes(evaluador.id)){
        return res.status(401).json({ error: "No estás asignado como evaluador de este proyecto" });
    }

    req.proyecto = proyecto;
    req.evaluador = evaluador;
    req.feria = feria;

    next();

  } catch (error) {
    console.log(error);
    res.status(409).json({ error: "Error al comprobar si el usuario es evaluador del proyecto" });
  }

}