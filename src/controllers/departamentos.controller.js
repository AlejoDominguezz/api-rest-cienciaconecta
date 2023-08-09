import {EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js';
import { response, request } from 'express';

export const getDepartamentos = async (req = request, res = response) => {
    try {
        const departamentosAggregation = await EstablecimientoEducativo.aggregate([
            { $group: { _id: "$departamento" } },
            { $project: { _id: 0, departamento: "$_id" } }
        ]);

        const departamentos = departamentosAggregation.map(item => item.departamento);

        res.json({
            departamentos
        });
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
        return res.status(500).json({
            error: 'Error al obtener los departamentos'
        });
    }
};


export const getDepartamentosForValidation = async () => {
    try {
        const departamentosAggregation = await EstablecimientoEducativo.aggregate([
            { $group: { _id: "$departamento" } },
            { $project: { _id: 0, departamento: "$_id" } }
        ]);

        const departamentos = new Set(departamentosAggregation.map(item => item.departamento));

        return departamentos;
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
        return new Set(); // Retorna un conjunto vacío en caso de error
    }
};
