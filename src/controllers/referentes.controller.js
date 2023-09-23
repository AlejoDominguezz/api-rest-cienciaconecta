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