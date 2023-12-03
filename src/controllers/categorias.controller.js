import { response , request } from 'express';
import {Categoria} from '../models/Categoria.js';


export const getCategorias = async(req = request, res = response) => {

    try {
        const categoria = await Categoria.find({
            $or: [
                { activa: true },
                { activa: { $exists: false } } 
            ]
        })
        .select('-__v')
        .lean()
        .exec()

        return res.json({
            categoria
        });

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
}


export const crearCategoria = async(req = request, res = response) => {

    try {
        const {nombre, abreviatura, color} = req.body;

        const categoria_existente = await Categoria.findOne({nombre: nombre, activa: true})
        if(categoria_existente){
            return res.status(422).json({error: `Ya existe una categoría activa con el nombre ${nombre}`})
        }

        const categoria = new Categoria({
            nombre, 
            abreviatura,
            color,
            activa: true,
        })

        const cat = await categoria.save()

        return res.json({msg: `La categoria '${nombre}' se ha creado con éxito`, id: cat._id})
    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
}


export const eliminarCategoria = async(req = request, res = response) => {

    try {
        const {id} = req.params;

        const categoria = await Categoria.findById(id)
        if(!categoria){
            return res.status(404).json({error: "No se ha encontrado ninguna categoría con el ID ingresado"})
        }

        categoria.activa = false;
        categoria.save();

        return res.json({msg: `La categoria '${categoria.nombre}' se ha eliminado con éxito`})
    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
    


}
