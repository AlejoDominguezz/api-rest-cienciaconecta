import { response, request } from "express";
import {Usuario} from '../models/Usuario.js';
import bcripyjs from 'bcryptjs';

export const crearUsuario = async (req = request, res = response) => {
  //leer del body los atributos del usuario y grabarlos en base de datos, y retornar el usuario creado

  const { nombre, apellido , cuil , email , password , dni} = req.body;

  const usuario = new Usuario({nombre, apellido , cuil , email , password , dni});

  //encriptar la contraseña - Resuelto con UsuarioSchema.pre()
  //const salt = bcripyjs.genSaltSync();
  //usuario.password = bcripyjs.hashSync( password , salt );

  //guardar el registro en bd
  await usuario.save();

  res.status(201).json({
      msg: 'Usuario registrado',
      usuario
  });

};


