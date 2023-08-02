import {EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js';
import { response, request } from 'express';

export const getLocalidades = async (req = request, res = response) => {
    try {
        const { departamento } = req.params;

        const localidadesAggregation = await EstablecimientoEducativo.aggregate([
            { $match: { departamento: departamento } }, // Filtrar por el departamento especificado
            { $group: { _id: "$localidad" } },
            { $project: { _id: 0, localidad: "$_id" } }
        ]);

        const localidades = localidadesAggregation.map(item => item.localidad);

        res.json({
            localidades
        });
    } catch (error) {
        console.error('Error al obtener las localidades:', error);
        return res.status(500).json({
            error: 'Error al obtener las localidades'
        });
    }
};