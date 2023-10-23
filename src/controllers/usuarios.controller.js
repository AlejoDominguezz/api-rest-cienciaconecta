import { response, request } from "express";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { existeEmail } from "../helpers/db-validar.js";


export const deleteUser = async (req = request, res = response) => {
  try {
    //recibo el id como parametro
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: '0' });
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

//obtener información del propio usuario
export const getOwnUser = async (req, res) => {
  try {
    const id = req.uid;
    //obtengo los docentes y a partir de la referencia a usuario obtengo los datos tambien de usuario
    const usuario = await Usuario.findById(id)
      .select('-__v -password -tokenConfirm -tokenRecuperacion')
      .lean()
      .exec();
      
    if(!usuario) {
      res.status(404).json({
        error: "No existe el usuario con el ID ingresado",
      });
    }

    const docente = await Docente.findOne({usuario: id})
      .select('-__v -usuario')
      .lean()
      .exec();

    if (!docente) {
      res.status(404).json({
        error: "No existe el docente asociado al usuario con el ID ingresado",
      });
    }

    docente.usuario = usuario
     
    return res.json({ usuario: docente });
    
  } catch (error) {
    res.status(500).json({
      error: "Error de servidor",
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      nombre,
      apellido,
      email,
      telefono,
      cargo,
    } = req.body;

    const user = await Usuario.findById(id);

    if (!user) {
      return res.status(404).json({ error: "No existe el usuario con el ID ingresado" });
    }

    const docente = await Docente.findOne({ usuario: id });

    // Actualización del usuario

    user.email = email || user.email;

    // Actualización del docente

    docente.nombre = nombre || docente.nombre;
    docente.apellido = apellido || docente.apellido;
    docente.telefono = telefono || docente.telefono;
    docente.cargo = cargo || docente.cargo;


    await user.save();
    await docente.save();

    return res.json({
      msg: "Usuario actualizado con éxito"
    });

  } catch (error) {
    res.status(500).json({ error: "Error de servidor" });
  }

};
