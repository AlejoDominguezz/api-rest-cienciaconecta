//logica de negocio para validar roles

import { Docente } from "../models/Docente.js";
import { Proyecto } from "../models/Proyecto.js";
import { roles } from "../helpers/roles.js";

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
