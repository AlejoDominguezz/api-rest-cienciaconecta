import { response, request } from "express";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { existeEmail } from "../helpers/db-validar.js";


export const deleteUser = async (req = request, res = response) => {
  try {
    //recibo el id como parametro
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });
    //revisar el token que devuelve

    //usuario autenticado que deberia tener ROL de comisión (se incluye luego)
    
    const usuarioAutenticado = req.uid;

    res.json({
      msg: "Usuario eliminado...",
      usuario_eliminado: usuario,
      usuario_autenticado: usuarioAutenticado,
    });
  } catch (error) {
    console.error(error);
  }
};

//obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    //obtengo los docentes y a partir de la referencia a usuario obtengo los datos tambien de usuario
    const docentes = await Docente.find().populate("usuario");
    if (!docentes) {
      res.status(401).json({
        msg: "Error al traer los docentes",
      });
    } else {
      res.json({
        usuarios: docentes,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      nombre,
      apellido,
      cuil,
      telefono,
      dni,
      cue,
      cargo,
      password,
      rol
    } = req.body;

  } catch (error) {
    console.error(error);
  }

};
