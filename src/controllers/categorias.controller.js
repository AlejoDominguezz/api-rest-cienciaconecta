import { response , request } from 'express';
import {Categoria} from '../models/Categoria.js';


export const getCategorias = async(req = request, res = response) => {

    const categoria = await Categoria.find()

    res.json({
        categoria
    });

}
