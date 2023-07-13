import { Proyecto } from "../models/Proyecto.js";
import { Docente } from "../models/Docente.js";
import { existeProyecto } from "../helpers/db-validar.js";

export const inscribirProyectoEscolar = async (req, res) => {
    const {titulo, descripcion, nivel, categoria, nombreEscuela, cueEscuela, privada, emailEscuela} = req.body;

    try {
        existeProyecto(titulo);

        const uid = req.uid;
        const responsable = await Docente.findOne({usuario: uid })

        const proyecto = new Proyecto({titulo, descripcion, nivel, categoria, nombreEscuela, cueEscuela, privada, emailEscuela, idResponsable: responsable._id})
        
        await proyecto.save()

        return res.json({ok: true})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Error de servidor"});
    }
}

