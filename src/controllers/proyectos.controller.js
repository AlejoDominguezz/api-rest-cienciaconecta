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


export const eliminarProyecto = async (req, res) => {
    try {
        const {id} =  req.params;
        const proyecto = await Proyecto.findById(id)
        
        if(!proyecto) return res.status(404).json({error: "No existe el proyecto"})
        
        await proyecto.deleteOne()

        return res.json({proyecto})

    } catch (error) {
        console.log(error)
        if(error.kind === "ObjectId") return res.status(403).json({error: "Formato ID incorrecto"})
        res.status(500).json({error: "Error de servidor"})
    }
}


export const modificarProyecto = async (req, res) => {
    try {
        const {id} =  req.params;
        const {titulo, descripcion, nivel, categoria, nombreEscuela, cueEscuela, privada, emailEscuela} = req.body;

        let proyecto = await Proyecto.findById(id)
        
        if(!proyecto) return res.status(404).json({error: "No existe el proyecto"})

        proyecto.titulo = titulo ?? proyecto.titulo;
        proyecto.descripcion = descripcion ?? proyecto.descripcion;
        proyecto.nivel = nivel ?? proyecto.nivel;
        proyecto.categoria = categoria ?? proyecto.categoria;
        proyecto.nombreEscuela = nombreEscuela ?? proyecto.nombreEscuela;
        proyecto.cueEscuela = cueEscuela ?? proyecto.cueEscuela;
        proyecto.privada = privada ?? proyecto.privada;
        proyecto.emailEscuela = emailEscuela ?? proyecto.emailEscuela;

        await proyecto.save()

        return res.json({proyecto})

    } catch (error) {

        console.log(error)
        if(error.kind === "ObjectId") return res.status(403).json({error: "Formato ID incorrecto"})
        res.status(500).json({error: "Error de servidor"})
    }
}


export const consultarProyecto = async (req, res) => {
    try {
        const {id} =  req.params;
        const proyecto = await Proyecto.findById(id)
        
        if(!proyecto) return res.status(404).json({error: "No existe el link"})

        return res.json({proyecto})

    } catch (error) {

        console.log(error)
        if(error.kind === "ObjectId") return res.status(403).json({error: "Formato ID incorrecto"})
        res.status(500).json({error: "Error de servidor"})
    }
    

}


export const consultarProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.find()
        return res.json({proyectos})

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error de servidor"})
    }
}