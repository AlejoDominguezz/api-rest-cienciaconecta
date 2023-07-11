const { response, request } = require("express");
const {Usuario} = require('../models');
const bcripyjs = require('bcryptjs');


const crearUsuario = async (req = request, res = response) => {
  //leer del body los atributos del usuario y grabarlos en base de datos, y retornar el usuario creado

  const { nombre, apellido , cuil , correo , password , dni} = req.body;

  const usuario = new Usuario({nombre, apellido , cuil , correo , password , dni});


  //encriptar la contraseña
  const salt = bcripyjs.genSaltSync();
  usuario.password = bcripyjs.hashSync( password , salt );

  //guardar el registro en bd
  await usuario.save();

  res.status(201).json({
      msg: 'Usuario registrado',
      usuario
  });

};

module.exports = {
  crearUsuario,
};
