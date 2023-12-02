//logica de negocio para validar roles

import { Docente } from "../models/Docente.js";
import { Proyecto } from "../models/Proyecto.js";
import { roles } from "../helpers/roles.js";
import { Evaluador } from "../models/Evaluador.js";
import { Feria } from "../models/Feria.js";
import { esActiva } from "../controllers/ferias.controller.js"
import { Referente } from "../models/Referente.js";

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


export const blockRolAuth = (roles) => async (req, res, next) => {
  try {
    const rolesData = req.roles;

    if (rolesData.some((role) => roles.includes(role))) {
      res.status(403).json({ error: "No tienes los permisos necesarios para realizar esta acción" });
    } else {
      next();
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

    req.proyecto = proyecto;

    next();

  } catch (error) {
    console.log(error);
    res.status(409).json({ error: "Error al comprobar el propietario" });
  }
};


export const esPropietarioHistorico = async (req, res, next) => {
  try {
    const idUsuario = req.uid;
    const { id } = req.params;
    const rolesData = req.roles;

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

    req.proyecto = proyecto;

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

    req.proyecto = proyecto;

    const feria = await Feria.findById(proyecto.feria)
    if(!esActiva(feria)){
        return res.status(401).json({ error: "El proyecto tiene asignado una Feria que ya ha finalizado" });
    }

    req.feria = feria;

    const docente = await Docente.findOne({usuario: uid})
    if(!docente){
        return res.status(404).json({ error: "No existe el docente asociado al usuario" });
    }

    if(!req.roles.includes(roles.evaluador)){
      return next()
    }

    // Si es referente, dejamos pasar al siguiente middleware que valida si es referente del proyecto
    if(req.roles.includes(roles.refEvaluador)){
      return next();
    }

    const evaluador = await Evaluador.findOne({idDocente: docente.id})
    if(!evaluador){
        return res.status(404).json({ error: "No existe el evaluador asociado al docente" });
    }

    if(!proyecto.evaluadoresRegionales.includes(evaluador.id)){
        return res.status(401).json({ error: "No estás asignado como evaluador de este proyecto" });
    }

    req.evaluador = evaluador;

    next();

  } catch (error) {
    console.log(error);
    res.status(409).json({ error: "Error al comprobar si el usuario es evaluador del proyecto" });
  }

}


export const esReferenteDelProyecto = async (req, res, next) => {
  
  try {
    // Si es evaluador, dejamos pasar ya que pasó el middleware de evaluador
    if(!req.roles.includes(roles.refEvaluador)){
      return next();
    }

    const { id } =  req.params; // ID Proyecto
    const uid = req.uid;

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        return res.status(404).json({ error: "No existe el proyecto" });
    }

    req.proyecto = proyecto;

    const docente = await Docente.findOne({usuario: uid})
    if(!docente){
        return res.status(404).json({ error: "No existe el docente asociado al usuario" });
    }

    const referente = await Referente.findOne({idDocente: docente.id})
    if(!referente){
      return res.status(404).json({ error: "No existe el referente asociado al docente" });
    }

    if(proyecto.sede.toString() != referente.sede.toString()){
        return res.status(401).json({ error: "No estás asignado como referente de este proyecto" });
    }

    req.referente = referente;

    next();

  } catch (error) {
    console.log(error);
    res.status(409).json({ error: "Error al comprobar si el usuario es evaluador del proyecto" });
  }

}


export const esIDUsuarioLogueado = async (req, res, next) => {
  const rolesData = req.roles;
  if(rolesData.includes(roles.comAsesora) || rolesData.includes(roles.admin)){
    return next();
  }

  const id_ingresado = req.params.id;
  const id = req.uid

  if(id.toString() == id_ingresado.toString()){
    return next();
  }

  return res.status(401).json({error: "El ID ingresado no se corresponde con el usuario logueado"})
}

