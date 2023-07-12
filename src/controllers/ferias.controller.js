import { response , request } from 'express';
import {Feria} from '../models/feria.js';


export const getFerias = async(req = request, res = response) => {

    const ferias = await Feria.find()

    res.json({
        ferias
    });

}

