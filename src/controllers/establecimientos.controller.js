import {EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js';
import { response, request } from 'express';
import { Feria, estadoFeria } from '../models/Feria.js';

export const getEstablecimientosEducativos = async (req = request, res = response) => {
    try {
        const { localidad } = req.params;

        // const establecimientosAggregation = await EstablecimientoEducativo.aggregate([
        //     { $match: { localidad: localidad } }, // Filtrar por el departamento especificado
        //     { $group: { _id: "$nombre" } },
        //     { $project: { _id: 0, establecimiento: "$_id" } }
        // ]);

        // const establecimientos = establecimientosAggregation.map(item => item.establecimiento);

        const establecimientos = await EstablecimientoEducativo.find({ localidad: localidad });

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

export const getEstablecimientoById = async (req = request, res = response) => {
    try {
        const { id } = req.params;

        const establecimiento = await EstablecimientoEducativo.findById(id);

        res.json({
            establecimiento
        });
    } catch (error) {
        console.error('Error al obtener el establecimiento educativo:', error);
        return res.status(500).json({
            error: 'Error al obtener el establecimiento educativo'
        });
    }
};


export const getSedesRegionalesActuales = async (req = request, res = response) => {
    try {
        const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})
        if (!feriaActiva) {
            return res.status(404).json({ error: 'No existe una feria activa en este momento' });
        }

        // Obtener las sedes regionales de la feria activa
        const sedesRegionales = feriaActiva.instancias.instanciaRegional.sedes;

        // Obtener los detalles de las sedes desde el modelo EstablecimientoEducativo
        const sedesRegionalesDetalles = await EstablecimientoEducativo.find({
            _id: { $in: [...sedesRegionales] }
        });

        res.json({
            sedes: sedesRegionalesDetalles
        });

    } catch (error) {
        console.error('Error al obtener las sedes:', error);
        return res.status(500).json({
            error: 'Error al obtener las sedes:'
        });
    }
};


export const getSedeProvincialActual = async (req = request, res = response) => {
    try {
        const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})
        if (!feriaActiva) {
            return res.status(404).json({ error: 'No existe una feria activa en este momento' });
        }

        // Obtener la sede provincial de la feria activa
        const sedeProvincial = feriaActiva.instancias.instanciaProvincial.sede;

        // Obtener los detalles de las sedes desde el modelo EstablecimientoEducativo
        const sedeProvincialDetalles = await EstablecimientoEducativo.findById(sedeProvincial);

        res.json({
            sede: sedeProvincialDetalles
        });

    } catch (error) {
        console.error('Error al obtener las sedes:', error);
        return res.status(500).json({
            error: 'Error al obtener las sedes:'
        });
    }
};

export const crearEstablecimientoEducativo = async(req, res) => {
    let { nombre, cue,  departamento, localidad, domicilio, CP, telefono, email, niveles } = req.body

    try {

        if (nombre) {
            nombre = nombre.toUpperCase();
        }
        if (departamento) {
            departamento = departamento.toUpperCase();
        }
        if (localidad) {
            localidad = localidad.toUpperCase();
        }
        if (domicilio) {
            domicilio = domicilio.toUpperCase();
        }

        const establecimiento = new EstablecimientoEducativo({
            nombre,
            cue, 
            provincia: "Córdoba",
            departamento,
            localidad,
            domicilio,
            CP,
            telefono,
            email,
            niveles,
        })

        await establecimiento.save()
        return res.json({ establecimiento });

    } catch (error) {
        console.log(`Ha ocurrido un problema al crear un establecimiento educativo + ${error}`)
        return res.status(500).json({ error: "Error de servidor" });
    }

}

export const checkEstablecimientoIsSede = async (sedeId) => {
    try {
      const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada } });
      if (!feriaActiva) {
        throw new Error('No existe una feria activa en este momento');
      }

      // Obtener las sedes de ambas instancias de la feria activa
      const sedesRegionalesActivas = feriaActiva.instancias.instanciaRegional.sedes;
      const sedeProvincialActiva = feriaActiva.instancias.instanciaProvincial.sede;
  
    if (sedeProvincialActiva.toString() === sedeId) {
      return true; // La sedeId es la sede provincial activa
    }

    if (sedesRegionalesActivas.includes(sedeId)) {
      return true; // La sedeId está en las sedes regionales activas
    }

    return false; // La sedeId no es una sede activa

    } catch (error) {
      console.error('Error al obtener la sede actual:', error);
      throw new Error('El establecimiento ingresado no es una sede actual:');
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