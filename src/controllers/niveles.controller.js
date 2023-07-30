import { response , request } from 'express';
import {Nivel} from '../models/Nivel.js';


export const getNiveles = async(req = request, res = response) => {

    const nivel = await Nivel.find()

    res.json({
        nivel
    });

}