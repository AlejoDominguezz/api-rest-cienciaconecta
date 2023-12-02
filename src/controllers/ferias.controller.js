import { response , request } from 'express';
import {Feria, estadoFeria, fechasFeria, nombreEstadoFeria} from '../models/Feria.js';
import { EstablecimientoEducativo} from '../models/EstablecimientoEducativo.js'
import { Usuario } from '../models/Usuario.js';
import { Proyecto, estado } from '../models/Proyecto.js';
import { generarJobsAsincronicos } from '../services/drive/feriaJobs.js';
import { getSedesRegionalesActualesFunction, getSedesRegionalesFeria } from './establecimientos.controller.js';
import { Evaluador } from '../models/Evaluador.js';
import { infoFeria } from '../helpers/infoFeria.js';

// Funcion para visualizar un listado de ferias --------------------------
export const getFerias = async(req = request, res = response) => {

  try {
    
    const {
      nombre,
      descripcion,
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
  
    let ferias = await Feria.find(filtro)

    ferias = ferias.map((feria) => {
      return {
        ...feria.toObject(),
        nombreEstado: nombreEstadoFeria[feria.estado],
      };
    });

    res.json({
        ferias
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
  
}


// Funcion para visualizar la feria activa actual --------------------------
export const getFeriaActiva = async(req = request, res = response) => {

  try {
    const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})

    if(!feriaActiva)
      return res.status(204).json();

    return res.json({feriaActiva});

  } catch (error) {
    //console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

// Funcion para devolver la feria activa actual (es utilizado por el middleware de fechas) --------------------------
export const getFeriaActivaFuncion = async() => {

  try {
    const feriaActiva = await Feria.findOne({ estado: { $ne: estadoFeria.finalizada }})

    if(!feriaActiva)
      return null;

    return feriaActiva
  } catch (error) {
    //console.log(error);
    return null
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
      //console.log(error);
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
    //feria.instancias.instanciaProvincial.sede = instancias.instanciaProvincial.sede ?? feria.instancias.instanciaProvincial.sede;

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
    //console.log(error);
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
    //console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


export const obtenerInfoResumidaFeria = async (req, res) => {
  
  const {
    id,
  } = req.query;

  let feriaActiva = null;
  if(!id){
    feriaActiva = await getFeriaActivaFuncion();
  } else {
    feriaActiva = await Feria.findById(id)
  }
  
  if(!feriaActiva){
    return res.status(204).json();
  }
  
  const {instancia_actual, prox_instancia} = obtenerFaseFeria(parseInt(feriaActiva.estado));
  const prox_fecha = convertirFecha(eval(`feriaActiva.${obtenerProximaFecha(parseInt(feriaActiva.estado))}`))

  let sedes = null;
  if(!id){
    sedes = await getSedesRegionalesActualesFunction()
  } else {
    sedes = await getSedesRegionalesFeria(feriaActiva)
  }
  
  let feria = {
    sedes: []
  };

  // Recorrer cada sede para obtener información específica
  let total_proyectosPresentados = 0;
  let total_evaluadores = 0;
  let total_proyectosEvaluados_Regional = 0;
  let total_proyectosEvaluados_Provincial = 0;

  for (let i = 0; i < sedes.sedes.length; i++) {
    const sede = sedes.sedes[i];

    const proyectos = await Proyecto.find({feria: feriaActiva._id, sede: sede._id})
    const cantidadProyectosPresentados = proyectos.length
    total_proyectosPresentados += cantidadProyectosPresentados;

    const cantidadEvaluadores = await Evaluador.countDocuments({feria: feriaActiva._id, pendiente: false, sede: sede._id})
    total_evaluadores += cantidadEvaluadores;

    if(parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_ExposicionFinalizada)) {
      const proyectosEvaluados_Regional = proyectos.filter((proyecto) => proyecto.estado == estado.evaluadoRegional);
      const cantidadProyectosEvaluados_Regional = proyectosEvaluados_Regional.length
      total_proyectosEvaluados_Regional += cantidadProyectosEvaluados_Regional;
      sede.cantidadProyectosEvaluados = cantidadProyectosEvaluados_Regional;
    } else {
      const proyectosEvaluados_Provincial = proyectos.filter((proyecto) => proyecto.estado == estado.evaluadoProvincial || proyecto.estado == estado.promovidoNacional);
      const cantidadProyectosEvaluados_Provincial = proyectosEvaluados_Provincial.length;                                             
      total_proyectosEvaluados_Provincial += cantidadProyectosEvaluados_Provincial;  
      sede.cantidadProyectosEvaluados = cantidadProyectosEvaluados_Provincial;
    }
    
    // Modificar la estructura de datos de la sede
    sede.cantidadProyectosPresentados = cantidadProyectosPresentados;
    sede.cantidadEvaluadores = cantidadEvaluadores;

    // Eliminar otros atributos innecesarios en 'sede' si es necesario
    delete sede.niveles;
    delete sede.provincia;
    delete sede.departamento;
    delete sede.localidad;
    delete sede.domicilio;
    delete sede.CP;
    delete sede.telefono;
    delete sede.email;
    delete sede.ferias;
    delete sede.__v;

    const modifiedSede = {
      _id: sede._id,
      nombre: sede.nombre,
      cantidadProyectosPresentados,
      cantidadEvaluadores,
      cantidadProyectosEvaluados: sede.cantidadProyectosEvaluados
    };

    // Agregar la sede modificada a la matriz de sedes de feria
    feria.sedes.push(modifiedSede);
  }


  feria.instancia_actual = instancia_actual;
  feria.prox_fecha = prox_fecha;
  feria.prox_instancia = prox_instancia;
  feria.total_proyectosPresentados = total_proyectosPresentados;
  feria.total_evaluadores = total_evaluadores;

  if(parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_ExposicionFinalizada)) {
    feria.total_proyectosEvaluados = total_proyectosEvaluados_Regional;
  } else {
    feria.total_proyectosEvaluados = total_proyectosEvaluados_Provincial;
  }
  

  return res.json({feria})
}


const obtenerFaseFeria = (estado) => {
  if (estado >= estadoFeria.creada && estado <= estadoFeria.iniciada) {
      return { instancia_actual: "Escolar", prox_instancia: "Regional" };
  } else if (estado == estadoFeria.instanciaEscolar) {
      return { instancia_actual: "Escolar", prox_instancia: "Regional" };
  } else if (estado >= estadoFeria.instanciaEscolar_Finalizada && estado <= estadoFeria.instanciaRegional_ExposicionFinalizada) {
      return { instancia_actual: "Regional", prox_instancia: "Provincial" };
  } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaProvincial && estado <= estadoFeria.instanciaProvincial_ExposicionFinalizada) {
      return { instancia_actual: "Provincial", prox_instancia: "Nacional" };
  } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaNacional && estado <= estadoFeria.finalizada) {
      return { instancia_actual: "Nacional", prox_instancia: " - " };
  } else {
      return { instancia_actual: " - ", prox_instancia: " - " };
  }
};

const obtenerProximaFecha = (estado) => {
  if (estado >= estadoFeria.creada && estado <= estadoFeria.iniciada) {
      return fechasFeria.fechaInicioEscolar;
  } else if (estado == estadoFeria.instanciaEscolar) {
      return fechasFeria.fechaFinEscolar;
  } else if (estado >= estadoFeria.instanciaEscolar_Finalizada && estado <= estadoFeria.instanciaRegional_ExposicionFinalizada) {
      return fechasFeria.fechaPromocionAProvincial;
  } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaProvincial && estado <= estadoFeria.instanciaProvincial_ExposicionFinalizada) {
      return fechasFeria.fechaPromocionANacional;
  } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaNacional && estado <= estadoFeria.finalizada) {
      return fechasFeria.fechaFin;
  } else {
      return " - ";
  }
};



const convertirFecha = (fecha) => {
  const fechaObjeto = new Date(fecha);
  const dia = String(fechaObjeto.getDate()).padStart(2, '0');
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, '0');
  const anio = fechaObjeto.getFullYear().toString().slice(2);
  return `${dia}/${mes}/${anio}`;
};


export const obtenerEstadoFeria = async (req, res) => {
  const feria = await infoFeria();
  const respuesta = { feria }; 
  return res.json(respuesta);
}

export const getFeriaById = async(req , res) => {
  try {
    const {id} = req.params;
    const feriaActiva = await Feria.findById(id).select("-instancias.instanciaRegional.cupos -instancias.instanciaProvincial.cupos");


    if(!feriaActiva){
      return res.status(400).json({message: "ERROR AL INTENTAR MOSTRAR LA FERIA."});
    }else{
      return res.status(200).json({feriaActiva});
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
}