import { response , request } from 'express';
import {Categoria} from '../models/Categoria.js';


export const getCategorias = async(req = request, res = response) => {

    try {
        const categoria = await Categoria.find()
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

        const categoria = new Categoria({
            nombre, 
            abreviatura,
            color
        })

        await categoria.save()

        return res.json({msg: `La categoria '${nombre}' se ha creado con éxito`})
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

        categoria.deleteOne()

        return res.json({msg: `La categoria '${categoria.nombre}' se ha eliminado con éxito`})
    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
    


}
