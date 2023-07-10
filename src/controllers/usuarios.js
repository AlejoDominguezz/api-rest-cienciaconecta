const { response, request } = require("express");

//importar modelo de usuario



const crearUsuario = async (req = request, res = response) => {
//leer del body los atributos del usuario y grabarlos en base de datos, y retornar el usuario creado!
  res.json({
    msg: "ok",
  });
};

module.exports = {
  crearUsuario,
};
