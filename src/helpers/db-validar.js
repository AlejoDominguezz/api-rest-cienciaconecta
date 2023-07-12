import {Usuario} from '../models/usuario.js';

export const existeEmail = async (correo = '') => {

    const existeEm = await Usuario.findOne({correo});

    if(existeEm){
        throw new Error(`El correo [ ${correo} ] ya existe, debe elegir otro.`)
    }
}

