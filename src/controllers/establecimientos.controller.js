import {EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js';
import { response, request } from 'express';

export const getEstablecimientosEducativos = async (req = request, res = response) => {
    try {
        const { localidad } = req.params;

        const establecimientosAggregation = await EstablecimientoEducativo.aggregate([
            { $match: { localidad: localidad } }, // Filtrar por el departamento especificado
            { $group: { _id: "$nombre" } },
            { $project: { _id: 0, establecimiento: "$_id" } }
        ]);

        const establecimientos = establecimientosAggregation.map(item => item.establecimiento);

        res.json({
            establecimientos
        });
    } catch (error) {
        console.error('Error al obtener los establecimientos educativos:', error);
        return res.status(500).json({
            error: 'Error al obtener los establecimientos educativos'
        });
    }
};


// export const getEstablecimientoEducativo = async (req = request, res = response) => {
//     try {
//         const { id } = req.params;

//         const establecimiento = EstablecimientoEducativo.findById(id);

//         res.json({
//             establecimiento
//         });
//     } catch (error) {
//         console.error('Error al obtener el establecimiento educativo:', error);
//         return res.status(500).json({
//             error: 'Error al obtener los establecimiento educativo'
//         });
//     }
// };