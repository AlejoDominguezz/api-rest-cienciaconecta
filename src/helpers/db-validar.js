import {Usuario} from '../models/Usuario.js';
import {Proyecto} from '../models/Proyecto.js';

export const existeEmail = async (email = '') => {

    const existeEm = await Usuario.findOne({email});

    if(existeEm){
        throw new Error(`El correo [ ${email} ] ya existe, debe elegir otro.`)
    }
}

export const existeProyecto = async (titulo = '') => {
    const existeProy = await Proyecto.findOne({titulo});

    if(existeProy){
        throw new Error(`El proyecto "${titulo}" ya existe, elige otro título`)
    }
}
export const existsId = async ( id ) => {
    console.log(id)
    const existeId = await Usuario.findById(id);
    if(!existeId){
        throw new Error(`El id ingresado no existe! `)
    }
}

