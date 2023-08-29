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

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      nombre,
      apellido,
      //cuil,
      email,
      telefono,
      //dni,
      //cue,
      cargo,
      password,
      estado,
      roles
    } = req.body;

    const user = await Usuario.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const docente = await Docente.findOne({ usuario: id });

    // Actualización del usuario
    //user.cuil = cuil || user.cuil;
    user.email = email || user.email;
    user.roles = roles || user.roles;
    user.estado = estado || user.estado;
    user.password = password || user.password;

    // Actualización del docente
    docente.nombre = nombre || docente.nombre;
    docente.apellido = apellido || docente.apellido;
    docente.telefono = telefono || docente.telefono;
    //docente.dni = dni || docente.dni;
    docente.cargo = cargo || docente.cargo;
    //docente.cue = cue || docente.cue;

    await user.save();
    await docente.save();

    res.json({
      msg: "Usuario actualizado con éxito",
      usuario: user,
      docente: docente
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }

};
