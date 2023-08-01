import { response , request } from 'express';
import {Feria, estadoFeria} from '../models/Feria.js';
import { Usuario } from '../models/Usuario.js';
import { estado } from '../models/Proyecto.js';


export const getFerias = async(req = request, res = response) => {

  const {
    nombre,
    descripcion,
    logo,
    fechaInicioFeria,
    fechaFinFeria,
    fechaInicioPostulacionEvaluadores,
    fechaFinPostulacionEvaluadores,
    fechaInicioAsignacionProyectos,
    fechaFinAsignacionProyectos,
    estado,
    usuarioResponsable,
    instancias,
    
  } = req.query;

  // Crear un objeto de filtro con los parámetros de consulta presentes
  const filtro = {
    ...(nombre && { nombre }),
    ...(descripcion && { descripcion }),
    ...(logo && { logo }),
    ...(fechaInicioFeria && { fechaInicioFeria }),
    ...(fechaFinFeria && { fechaFinFeria }),
    ...(fechaInicioPostulacionEvaluadores && { fechaInicioPostulacionEvaluadores }),
    ...(fechaFinPostulacionEvaluadores && { fechaFinPostulacionEvaluadores }),
    ...(fechaInicioAsignacionProyectos && { fechaInicioAsignacionProyectos }),
    ...(fechaFinAsignacionProyectos && { fechaFinAsignacionProyectos }),
    ...(instancias && { instancias }),
    ...(estado && { estado }),
    ...(usuarioResponsable && { usuarioResponsable }),
  };

    const ferias = await Feria.find(filtro)

    res.json({
        ferias
    });
}

export const crearFeria = async (req, res) => {
    const {
      nombre,
      descripcion,
      logo,
      fechaInicioFeria,
      fechaFinFeria,
      instancias,
      fechaInicioPostulacionEvaluadores,
      fechaFinPostulacionEvaluadores,
      fechaInicioAsignacionProyectos,
      fechaFinAsignacionProyectos,
      criteriosEvaluacion,
    } = req.body;
  
    try {
  
      const uid = req.uid;
      const responsable = await Usuario.findById(uid);

      if(!responsable)  
        return res.status(401).json({ error: "No existe el usuario" });

      const existeNombreFeria = await Feria.findOne({nombre: nombre })
      if(existeNombreFeria)
        return res.status(401).json({ error: "Ya existe una feria con el nombre ingresado" });

      const existeFeriaActiva = await Feria.exists({$and: [
        { estado: { $ne: estadoFeria.inactiva } },
        { estado: { $ne: estadoFeria.finalizada } },
      ],})
      if(existeFeriaActiva)
        return res.status(401).json({ error: "Ya existe una feria activa en este momento" });

  
      const feria = new Feria({
        nombre,
        descripcion,
        logo,
        fechaInicioFeria,
        fechaFinFeria,
        instancias,
        fechaInicioPostulacionEvaluadores,
        fechaFinPostulacionEvaluadores,
        fechaInicioAsignacionProyectos,
        fechaFinAsignacionProyectos,
        criteriosEvaluacion,
        estado: '1',
        usuarioResponsable: responsable._id,
      });
  
      await feria.save();
  
      return res.json({ ok: true });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error de servidor" });
    }
  };
