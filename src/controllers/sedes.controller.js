import {Sede} from '../models/Sede.js';

// Funcion Básica para crear sedes (para testeo de proyecto). NO ES FUNCION FINAL
export const crearSede = async (req, res) => {
    const {nombre, cue} = req.body;

    try {
        const sede = new Sede({nombre, cue})
        
        await sede.save()

        return res.json({ok: true})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Error de servidor"});
    }
}