import { response, request } from "express";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import {existeEmail} from "../helpers/db-validar.js";

export const registerUser = async (req = request, res = response) => {
  const { nombre, apellido, cuil, email, password, dni, cue, telefono, cargo } =
    req.body;
  const estado = true;

  try {
    // Busco usuario por mail
    existeEmail(email);

    const user = new Usuario({ email, estado, password });
    const docente = new Docente({
      nombre,
      apellido,
      cuil,
      dni,
      cue,
      telefono,
      cargo,
      usuario: user._id,
    });

    await user.save();
    await docente.save();
    res.status(200).json({
      msg: "User creado",
      user,
      docente
    })
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({ error: "Ya existe este usuario" });
    }
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const deleteUser = async (req = request , res = response) => {
  try {
    //recibo el id como parametro
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id , {estado:false});
    //revisar el token que devuelve
    const usuarioAutenticado = req.uid;
    
    res.json({
        msg: 'Usuario eliminado...',
        usuario,
        usuarioAutenticado
    });

  } catch (error) {
    console.error(error);
  }




}
