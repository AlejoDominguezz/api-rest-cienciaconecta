import { response , request } from 'express';
import {Feria, estadoFeria} from '../models/Feria.js';
import { Usuario } from '../models/Usuario.js';
import { estado } from '../models/Proyecto.js';

// Funcion para visualizar un listado de ferias --------------------------
export const getFerias = async(req = request, res = response) => {

    const ferias = await Feria.find()

    res.json({
        ferias
    });
}


// Funcion para crear una feria --------------------------
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

      const existeFeriaActiva = await Feria.exists({ estado: { $ne: estadoFeria.finalizada }})
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
        estado: estadoFeria.creada,
        usuarioResponsable: responsable._id,
      });
  
      await feria.save();
  
      return res.json({ ok: true });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error de servidor" });
    }
  };

// Funcion para modificar una feria --------------------------
export const modificarFeria = async (req, res) => {
  
  const { id } = req.params;

  let feria = await Feria.findById(id);

  if (!feria)
    return res.status(404).json({ error: "No existe la Feria" });

  // if (feria.estado === estadoFeria.inactiva)
  //   return res
  //     .status(404)
  //     .json({ error: "La Feria ha sido dado de baja" });

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

    if(nombre && nombre !== feria.nombre){
      const existeNombreFeria = await Feria.findOne({nombre: nombre })
      if(existeNombreFeria)
        return res.status(401).json({ error: "Ya existe una feria con el nombre ingresado" });}

    // No se puede modificar los estados ni el usuario responsable

    feria.nombre = nombre ?? feria.nombre;
    feria.descripcion = descripcion ?? feria.descripcion;
    feria.logo = logo ?? feria.logo;
    feria.fechaInicioFeria = fechaInicioFeria ?? feria.fechaInicioFeria;
    feria.fechaFinFeria = fechaFinFeria ?? feria.fechaFinFeria;

    feria.instancias.instanciaEscolar.fechaInicioInstancia = instancias.instanciaEscolar.fechaInicioInstancia ?? feria.instancias.instanciaEscolar.fechaInicioInstancia;
    feria.instancias.instanciaEscolar.fechaFinInstancia = instancias.instanciaEscolar.fechaFinInstancia ?? feria.instancias.instanciaEscolar.fechaFinInstancia;
    
    feria.instancias.instanciaRegional.fechaInicioActualizacion = instancias.instanciaRegional.fechaInicioActualizacion ?? feria.instancias.instanciaRegional.fechaInicioActualizacion;
    feria.instancias.instanciaRegional.fechaFinActualizacion = instancias.instanciaRegional.fechaFinActualizacion ?? feria.instancias.instanciaRegional.fechaFinActualizacion;
    feria.instancias.instanciaRegional.fechaInicioEvaluacionTeorica = instancias.instanciaRegional.fechaInicioEvaluacionTeorica ?? feria.instancias.instanciaRegional.fechaInicioEvaluacionTeorica;
    feria.instancias.instanciaRegional.fechaFinEvaluacionTeorica = instancias.instanciaRegional.fechaFinEvaluacionTeorica ?? feria.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
    feria.instancias.instanciaRegional.fechaInicioEvaluacionPresencial = instancias.instanciaRegional.fechaInicioEvaluacionPresencial ?? feria.instancias.instanciaRegional.fechaInicioEvaluacionPresencial;
    feria.instancias.instanciaRegional.fechaFinEvaluacionPresencial = instancias.instanciaRegional.fechaFinEvaluacionPresencial ?? feria.instancias.instanciaRegional.fechaFinEvaluacionPresencial;
    feria.instancias.instanciaRegional.cupos = instancias.instanciaRegional.cupos ?? feria.instancias.instanciaRegional.cupos;
    feria.instancias.instanciaRegional.sedes = instancias.instanciaRegional.sedes ?? feria.instancias.instanciaRegional.sedes;

    feria.instancias.instanciaProvincial.fechaInicioActualizacion = instancias.instanciaProvincial.fechaInicioActualizacion ?? feria.instancias.instanciaProvincial.fechaInicioActualizacion;
    feria.instancias.instanciaProvincial.fechaFinActualizacion = instancias.instanciaProvincial.fechaFinActualizacion ?? feria.instancias.instanciaProvincial.fechaFinActualizacion;
    feria.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial = instancias.instanciaProvincial.fechaInicioEvaluacionPresencial ?? feria.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial;
    feria.instancias.instanciaProvincial.fechaFinEvaluacionPresencial = instancias.instanciaProvincial.fechaFinEvaluacionPresencial ?? feria.instancias.instanciaProvincial.fechaFinEvaluacionPresencial;
    feria.instancias.instanciaProvincial.cupos = instancias.instanciaProvincial.cupos ?? feria.instancias.instanciaProvincial.cupos;
    feria.instancias.instanciaProvincial.sede = instancias.instanciaProvincial.sede ?? feria.instancias.instanciaProvincial.sede;

    feria.fechaInicioPostulacionEvaluadores = fechaInicioPostulacionEvaluadores ?? feria.fechaInicioPostulacionEvaluadores;
    feria.fechaFinPostulacionEvaluadores = fechaFinPostulacionEvaluadores ?? feria.fechaFinPostulacionEvaluadores;
    feria.fechaInicioAsignacionProyectos = fechaInicioAsignacionProyectos ?? feria.fechaInicioAsignacionProyectos;
    feria.fechaFinAsignacionProyectos = fechaFinAsignacionProyectos ?? feria.fechaFinAsignacionProyectos;
    feria.criteriosEvaluacion = criteriosEvaluacion ?? feria.criteriosEvaluacion;

    await feria.save();

    return res.json({ feria });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


// Funcion para dar de baja a una feria --------------------------
export const eliminarFeria = async (req, res) => {
  
  const { id } = req.params;

  let feria = await Feria.findById(id);

  if (!feria)
    return res.status(404).json({ error: "No existe la Feria" });

  if (feria.estado !== estadoFeria.creada)
    return res
      .status(404)
      .json({ error: "No se puede dar de baja a una Feria ya comenzada" });

  
  try {
    await feria.deleteOne();

    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


