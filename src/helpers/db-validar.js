<<<<<<< HEAD
import {Usuario} from '../models/usuario.js';

export const existeEmail = async (correo = '') => {
=======
const Usuario = require('../models/usuario');

const existeEmail = async (correo = '') => {
>>>>>>> 3409789a50cf3b966a32c973f37e6211209a67e2

    const existeEm = await Usuario.findOne({correo});

    if(existeEm){
        throw new Error(`El correo [ ${correo} ] ya existe, debe elegir otro.`)
    }
}

<<<<<<< HEAD
=======
module.exports = {
    existeEmail
}
>>>>>>> 3409789a50cf3b966a32c973f37e6211209a67e2
