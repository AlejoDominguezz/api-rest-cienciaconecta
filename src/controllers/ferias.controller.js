import { response , request } from 'express';
import {Feria, estadoFeria} from '../models/Feria.js';
import { EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js'
import { Usuario } from '../models/Usuario.js';
import { estado } from '../models/Proyecto.js';
import { generarJobsAsincronicos } from '../services/drive/feriaJobs.js';

// Funcion para visualizar un listado de ferias --------------------------
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


// Funcion para visualizar la feria activa actual --------------------------
export const getFeriaActiva = async(req = request, res = response) => {

  try {
    const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})

    if(!feriaActiva)
      return res.status(401).json({ error: "No existe una feria activa en este momento" });

    res.json({
      feriaActiva
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

// Funcion para devolver la feria activa actual (es utilizado por el middleware de fechas) --------------------------
export const getFeriaActivaFuncion = async() => {

  try {
    const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})

    if(!feriaActiva)
      return res.status(401).json({ error: "No existe una feria activa en este momento" });

    return feriaActiva
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

export const esActiva = (feria) => {
  if(feria.estado == estadoFeria.finalizada){
    return false;
  }
  return true;
}


// Funcion para crear una feria --------------------------
export const crearFeria = async (req, res) => {
    const {
      nombre,
      descripcion,
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
  
      const feriaBD = await feria.save();

      // Obtener las sedes de la instancia regional y provincial
      const sedesRegionales = instancias.instanciaRegional.sedes;
      const sedeProvincial = instancias.instanciaProvincial.sede;

      // Agregar el ID de la feria a los atributos "ferias" de las sedes
      const sedesActualizar = [...sedesRegionales, sedeProvincial];

      await EstablecimientoEducativo.updateMany(
          { _id: { $in: sedesActualizar } },
          { $addToSet: { ferias: feriaBD._id } }
      );

      await generarJobsAsincronicos(feriaBD._id, null, req.body)
  
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
  const feriaOriginal = JSON.parse(JSON.stringify(feria));

  if (!feria)
    return res.status(404).json({ error: "No existe la Feria" });

  // if (feria.estado === estadoFeria.inactiva)
  //   return res
  //     .status(404)
  //     .json({ error: "La Feria ha sido dado de baja" });

  const {
    nombre,
    descripcion,
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

    // Obtén las ferias anteriores
    const feriasAnteriores = [...feria.instancias.instanciaRegional.sedes, feria.instancias.instanciaProvincial.sede];

    // No se puede modificar los estados ni el usuario responsable

    feria.nombre = nombre ?? feria.nombre;
    feria.descripcion = descripcion ?? feria.descripcion;
    feria.fechaInicioFeria = fechaInicioFeria ?? feria.fechaInicioFeria;
    feria.fechaFinFeria = fechaFinFeria ?? feria.fechaFinFeria;

    feria.instancias.instanciaEscolar.fechaInicioInstancia = instancias.instanciaEscolar.fechaInicioInstancia ?? feria.instancias.instanciaEscolar.fechaInicioInstancia;
    feria.instancias.instanciaEscolar.fechaFinInstancia = instancias.instanciaEscolar.fechaFinInstancia ?? feria.instancias.instanciaEscolar.fechaFinInstancia;
    
    feria.instancias.instanciaRegional.fechaInicioEvaluacionTeorica = instancias.instanciaRegional.fechaInicioEvaluacionTeorica ?? feria.instancias.instanciaRegional.fechaInicioEvaluacionTeorica;
    feria.instancias.instanciaRegional.fechaFinEvaluacionTeorica = instancias.instanciaRegional.fechaFinEvaluacionTeorica ?? feria.instancias.instanciaRegional.fechaFinEvaluacionTeorica;
    feria.instancias.instanciaRegional.fechaInicioEvaluacionPresencial = instancias.instanciaRegional.fechaInicioEvaluacionPresencial ?? feria.instancias.instanciaRegional.fechaInicioEvaluacionPresencial;
    feria.instancias.instanciaRegional.fechaFinEvaluacionPresencial = instancias.instanciaRegional.fechaFinEvaluacionPresencial ?? feria.instancias.instanciaRegional.fechaFinEvaluacionPresencial;
    feria.instancias.instanciaRegional.fechaPromocionAProvincial = instancias.instanciaRegional.fechaPromocionAProvincial ?? feria.instancias.instanciaRegional.fechaPromocionAProvincial;
    feria.instancias.instanciaRegional.cupos = instancias.instanciaRegional.cupos ?? feria.instancias.instanciaRegional.cupos;
    feria.instancias.instanciaRegional.sedes = instancias.instanciaRegional.sedes ?? feria.instancias.instanciaRegional.sedes;

    feria.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial = instancias.instanciaProvincial.fechaInicioEvaluacionPresencial ?? feria.instancias.instanciaProvincial.fechaInicioEvaluacionPresencial;
    feria.instancias.instanciaProvincial.fechaFinEvaluacionPresencial = instancias.instanciaProvincial.fechaFinEvaluacionPresencial ?? feria.instancias.instanciaProvincial.fechaFinEvaluacionPresencial;
    feria.instancias.instanciaProvincial.fechaPromocionANacional = instancias.instanciaProvincial.fechaPromocionANacional ?? feria.instancias.instanciaProvincial.fechaPromocionANacional;
    feria.instancias.instanciaProvincial.cupos = instancias.instanciaProvincial.cupos ?? feria.instancias.instanciaProvincial.cupos;
    feria.instancias.instanciaProvincial.sede = instancias.instanciaProvincial.sede ?? feria.instancias.instanciaProvincial.sede;

    feria.fechaInicioPostulacionEvaluadores = fechaInicioPostulacionEvaluadores ?? feria.fechaInicioPostulacionEvaluadores;
    feria.fechaFinPostulacionEvaluadores = fechaFinPostulacionEvaluadores ?? feria.fechaFinPostulacionEvaluadores;
    feria.fechaInicioAsignacionProyectos = fechaInicioAsignacionProyectos ?? feria.fechaInicioAsignacionProyectos;
    feria.fechaFinAsignacionProyectos = fechaFinAsignacionProyectos ?? feria.fechaFinAsignacionProyectos;
    feria.criteriosEvaluacion = criteriosEvaluacion ?? feria.criteriosEvaluacion;

    await feria.save();

    // Obtén las ferias nuevas
    const feriasNuevas = [...instancias.instanciaRegional.sedes, instancias.instanciaProvincial.sede];

    // Calcula las ferias eliminadas (presentes en feriasAnteriores pero no en feriasNuevas)
    const feriasEliminadas = feriasAnteriores.filter(feriaAnterior => !feriasNuevas.includes(feriaAnterior));

    // Calcula las ferias agregadas (presentes en feriasNuevas pero no en feriasAnteriores)
    const feriasAgregadas = feriasNuevas.filter(feriaNueva => !feriasAnteriores.includes(feriaNueva));

    // Elimina el ID de la feria actual de las ferias eliminadas
    await EstablecimientoEducativo.updateMany(
        { _id: { $in: feriasEliminadas } },
        { $pull: { ferias: feria._id } }
    );

    // Agrega el ID de la feria actual a las ferias agregadas
    await EstablecimientoEducativo.updateMany(
        { _id: { $in: feriasAgregadas } },
        { $addToSet: { ferias: feria._id } }
    );

    await generarJobsAsincronicos(feria._id, feriaOriginal, req.body)

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
    // Elimina el ID de la feria actual del atributo "ferias" en las sedes de la feria
    await EstablecimientoEducativo.updateMany(
      { _id: { $in: [...feria.instancias.instanciaRegional.sedes, feria.instancias.instanciaProvincial.sede] } },
      { $pull: { ferias: feria._id } }
    );

    await feria.deleteOne();

    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


