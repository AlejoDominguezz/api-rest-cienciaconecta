import { Evaluador } from "../models/Evaluador.js";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { Feria, estadoFeria } from "../models/Feria.js";
import { roles } from "../helpers/roles.js";
import { seleccionMailHtml } from "../helpers/seleccionMail.js";
import { transporter } from "../helpers/mailer.js";

export const postularEvaluador = async (req, res) => {
    try {

        const uid = req.uid;
        const _docente = await Docente.findOne({usuario: uid})
        if(!_docente)  
            return res.status(401).json({ error: "No existe el docente" });

        const postulacion = await Evaluador.findOne({idDocente: _docente._id})
        if(postulacion)
            return res.status(403).json({ error: "Este usuario ya se ha postulado como evaluador" });

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


export const getPostulaciones = async (req, res) => {
    try {
        const postulaciones = await Evaluador.find({pendiente: true})
        if(postulaciones.length === 0) {
            return res.status(204).json({ error: "No se han encontrado postulaciones pendientes" });
        }
        
        const postulacionesConDatosDocente = await Promise.all(postulaciones.map(async (postulacion) => {
            const datos_docente = await Docente.findById(postulacion.idDocente);
            return {
                ...postulacion.toObject(),
                datos_docente: datos_docente.toObject()
            };
        }));
        
        
        return res.json({ postulaciones: postulacionesConDatosDocente });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
}

export const seleccionarEvaluadores = async (req, res) => {
    try {
        const {
            postulaciones
        } = req.body

        var falloMail = false;
        var errores = [];

        for(const idSeleccionado of postulaciones){

            const postulacion = await Evaluador.findById(idSeleccionado)
            if(!postulacion)  
                return res.status(401).json({ error: "No existe la postulación" });

            const docente = await Docente.findById(postulacion.idDocente)
            if(!docente)  
                return res.status(401).json({ error: "No existe el docente asociado a la postulación" });

            const usuario = await Usuario.findById(docente.usuario)
            if(!usuario)  
                return res.status(401).json({ error: "No existe el usuario asociado al docente" });

            if(!usuario.roles.includes(roles.evaluador)){
                usuario.roles.push(roles.evaluador)
                postulacion.pendiente = false;

                usuario.save()
                postulacion.save()

                try {
                    await enviarMailSeleccion(usuario, docente)
                } catch (error) {
                    falloMail = true;
                    errores.push(`Fallo en el envío de mail a ${usuario.email}`)
                }

            } else {
                return res.status(403).json({ error: "Este usuario ya posee el rol de evaluador" });
            }
            
        }

        if (!falloMail){
            return res.json({ ok: true,  responseMessage: "Se han enviado todos los emails correctamente"});
        } else {
            return res.json({ ok: true,  responseMessage: errores});
        }
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
}


const enviarMailSeleccion = async (usuario, docente) => {
    try {
        await transporter.sendMail({
            from: 'Ciencia Conecta',
            to: usuario.email,
            subject: "Resultado de Postulación como Evaluador",
            html: seleccionMailHtml(docente)
          });

        // Verificar si el correo se envió exitosamente
        if (info.accepted.length === 0) {
            // No se pudo enviar el correo
            throw new Error(`No se pudo enviar el correo a ${usuario.email}`);
        }

    } catch (error) {
        throw error;
    }
    
}