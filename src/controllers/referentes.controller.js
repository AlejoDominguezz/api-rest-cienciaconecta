import { roles } from "../helpers/roles.js";
import { Docente } from "../models/Docente.js";
import { Referente } from "../models/Referente.js";
import { Usuario, estadoUsuario } from "../models/Usuario.js";
import { getFeriaActivaFuncion } from "./ferias.controller.js";

export const seleccionarReferentes = async (req, res) => {
    try {
        const {seleccion} = req.body;

        for (const obj of seleccion) {
            
            const docente = await Docente.findById(obj.referente)
            if(!docente){
                return res.status(401).json({ error: `${obj.referente} no es un ID de un docente registrado` });
            }

            const usuario = await Usuario.findById(docente.usuario)
            if(!usuario){
                return res.status(401).json({ error: `${obj.referente} no tiene asociado a un usuario registrado` });
            }

            const feriaActiva = await getFeriaActivaFuncion()

            const referente = new Referente({
                sede: obj.sede,
                idDocente: obj.referente,
                evaluadoresAsignados: [],
                feria: feriaActiva._id
            })

            if(usuario.roles.includes(roles.refEvaluador)){
                return res.status(401).json({ error: `${obj.referente} ya ha sido seleccionado como referente de evaluador` });
            }


            if(usuario.roles.includes(roles.evaluador)){
                usuario.roles.push(roles.refEvaluador)
                usuario.roles = usuario.roles.filter(rol => rol !== roles.evaluador);
            } else {
                usuario.roles.push(roles.refEvaluador)
            }

            usuario.save()
            referente.save()

        }
        return res.json({msg: "Se han seleccionado todos los referentes correctamente"}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }

}


export const modificarReferente = async (req, res) => {
    try {
        const {id} = req.params;
        const {sede} = req.body;

        const feriaActiva = await getFeriaActivaFuncion()

        const referente = await Referente.findById(id);
        if(!referente){
            return res.status(401).json({ error: `${id} no es un ID de un referente seleccionado` });
        }
        if(referente.feria != feriaActiva.id){
            return res.status(401).json({ error: "No se permite modificar un referente de una feria anterior" });
        }

        referente.sede = sede.toString()
        referente.save()

        return res.json({referente}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }

}


export const eliminarReferente = async (req, res) => {
    try {
        const {id} = req.params;

        const feriaActiva = await getFeriaActivaFuncion()

        const referente = await Referente.findById(id);
        if(!referente){
            return res.status(401).json({ error: `${id} no es un ID de un referente seleccionado` });
        }
        if(referente.feria != feriaActiva.id){
            return res.status(401).json({ error: "No se permite eliminar un referente de una feria anterior" });
        }

        const docente = await Docente.findById(referente.idDocente);
        if(!docente){
            return res.status(401).json({ error: `${id} no tiene un docente asociado registrado` });
        }

        const usuario = await Usuario.findById(docente.usuario);
        if(!usuario){
            return res.status(401).json({ error: `${id} no tiene un usuario asociado registrado` });
        }

        usuario.roles = usuario.roles.filter(rol => rol !== roles.refEvaluador);
        usuario.save()
        referente.deleteOne()

        return res.json({ msg: `El referente con ID ${id} se ha eliminado correctamente`}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }

}


export const obtenerReferentesSeleccionados = async (req, res) => {
    try {
        const feriaActiva = await getFeriaActivaFuncion()

        const referentesAsignados = await Referente.find({feria: feriaActiva._id})
        .select('-__v -feria')
        .lean()
        .exec();

        const referentesConDatosDocente = await Promise.all(
            referentesAsignados.map(async (referente) => {
                const docente = await Docente.findById(referente.idDocente)
                .select('-__v -_id')
                .lean()
                .exec();

                if (!docente) {
                    return res.status(401).json({ error: `${referente._id} no tiene asociado a un docente registrado` });
                }
                return {
                    ...referente,
                    datos_docente: docente,
                }
            })
        )


    return res.json({referentes: referentesConDatosDocente}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
}





export const obtenerListadoDocentes = async (req, res) => {
    

    try {


        const {cuil} = req.query

        const consulta = {
            roles: {$nin: [roles.refEvaluador, roles.responsableProyecto, roles.comAsesora, roles.admin]},
            estado: estadoUsuario.activo
        }

        // Agregar el filtro de cuil si existe
        if (cuil) {
            consulta.cuil = { $regex: cuil, $options: 'i' };
        }

        const usuarios = await Usuario.find(consulta)
        .select('-password -tokenConfirm -estado -cuentaConfirmada -tokenRecuperacion -__v')
        .lean()
        .exec()

        if (usuarios.length == 0) {
            return res.status(204).json({ error: "No existen usuarios que cumplan las condiciones" });
        }

        const docentes = await Promise.all(
            usuarios.map(async (usuario) => {
              const docente = await Docente.findOne({usuario: usuario._id})
              .select('-__v -cuil -usuario')
              .lean()
              .exec();
      
              if(!docente){
                return {
                  ...usuario,
                }
              }
              return {
                ...usuario,
                datos_docente: docente,
              };
            })
          );

        
        return res.json({usuarios: docentes});
        
    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})

    }
    

}