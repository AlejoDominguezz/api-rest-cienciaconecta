import {Usuario} from '../models/Usuario.js';
import {Proyecto} from '../models/Proyecto.js';
import {Nivel} from '../models/Nivel.js';
import {Categoria} from '../models/Categoria.js';

export const existeEmail = async (email = '') => {

    const existeEm = await Usuario.findOne({email});

    if(existeEm){
        throw new Error(`El correo [ ${email} ] ya existe, debe elegir otro.`)
    }
}

export const existeProyecto = async (titulo = '') => {
    try{
        const existeProy = await Proyecto.findOne({titulo});

        if(existeProy){
            throw new Error(`El proyecto ${titulo} ya existe, elige otro título`)
        }
        return false; // No existe el proyecto
    } catch (error) {
        return { error: error.message };
    }
}

export const existsId = async ( id ) => {
    console.log(id)
    const existeId = await Usuario.findById(id);
    if(!existeId){
        throw new Error(`El id ingresado no existe! `)
    }
}

export const existeCuil = async (cuil = '') => {

    const existecuil = await Usuario.findOne({cuil});

    if(existecuil){
        throw new Error(`El CUIL ${cuil} ya existe, debe elegir otro.`)
    }
}

export const existeNivel = async (nivel = '') => {

    const existenivel = await Nivel.findById({_id: nivel});

    if(!existenivel){
        throw new Error(`El nivel elegido no existe`)
    }
}

export const existeCategoria = async (categoria = '') => {

    const existecategoria = await Categoria.findById({_id: categoria});

    if(!existecategoria){
        throw new Error(`La categoria elegida no existe`)
    }
}


export const fechaPosteriorA = (fechaA) => {
    return (fechaB) => {
      const fechaInicio = new Date(fechaA);
      const fechaFin = new Date(fechaB);
  
      if (fechaFin <= fechaInicio) {
        throw new Error('La fecha ingresada debe ser posterior a ' + fechaInicio.toString());
      }
  
      return true;
    };
};

export const fechaAnteriorA = (fechaA) => {
    return (fechaB) => {
      const fechaFin = new Date(fechaA);
      const fechaInicio = new Date(fechaB);
  
      if (fechaFin <= fechaInicio) {
        throw new Error('La fecha ingresada debe ser anterior a ' + fechaFin.toString());
      }
  
      return true;
    };
};




