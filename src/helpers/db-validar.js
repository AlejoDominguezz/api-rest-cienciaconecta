import {Usuario} from '../models/Usuario.js';

export const existeEmail = async (email = '') => {

    const existeEm = await Usuario.findOne({email});

    if(existeEm){
        throw new Error(`El correo [ ${email} ] ya existe, debe elegir otro.`)
    }
}

