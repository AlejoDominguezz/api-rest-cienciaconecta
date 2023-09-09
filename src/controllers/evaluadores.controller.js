import { Evaluador } from "../models/Evaluador.js";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { Feria, estadoFeria } from "../models/Feria.js";

export const postularEvaluador = async (req, res) => {
    try {

        const uid = req.uid;
        const _docente = await Docente.findOne({usuario: uid})
        if(!_docente)  
            return res.status(401).json({ error: "No existe el docente" });

        const postulacion = await Evaluador.findOne({idDocente: _docente._id})
        if(postulacion)
            return res.status(401).json({ error: "Este usuario ya se ha postulado como evaluador" });

        const {
            docente,
            niveles,
            categorias,
            sede,
            antecedentes,
        } = req.body;

        const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})
        if(!feriaActiva)
            return res.status(401).json({ error: "No existe una feria activa en este momento" });

        const evaluador = new Evaluador({
            docente,
            niveles,
            categorias,
            sede,
            antecedentes,
            feria: feriaActiva._id,
            pendiente: true,
            idDocente: _docente._id,
          });
    
          await evaluador.save();
          return res.json({ evaluador });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }

}