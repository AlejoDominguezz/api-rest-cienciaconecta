const Usuario = require('../models/usuario');

const existeEmail = async (correo = '') => {

    const existeEm = await Usuario.findOne({correo});

    if(existeEm){
        throw new Error(`El correo [ ${correo} ] ya existe, debe elegir otro.`)
    }
}

module.exports = {
    existeEmail
}