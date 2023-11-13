import { Evaluador } from "../models/Evaluador.js";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { Feria, estadoFeria } from "../models/Feria.js";
import { roles } from "../helpers/roles.js";
import formidable from "formidable";
import { drive } from "../services/drive/drive.js";
import {
  createFolder,
  shareFolderWithPersonalAccount,
  sendFileToDrive,
  downloadCv,
  downloadCvTwo,
  download_Cv
} from "../services/drive/helpers-drive.js";
import { getFeriaActivaFuncion } from "../controllers/ferias.controller.js"
import { emailCola, fileCv } from "../helpers/queueManager.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";
import { Evaluacion } from "../models/Evaluacion.js";
import { Proyecto, estado } from "../models/Proyecto.js";
import { convertirFecha, obtenerFaseFeria, obtenerProximaFecha } from "./referentes.controller.js";

export const postularEvaluador = async (req, res) => {
    try {

      const uid = req.uid;
      const user = await Usuario.findById(uid)
      if (user.roles.includes(roles.refEvaluador)){
        return res.status(403).json({ error: "Un usuario referente de evaluador no puede postularse como evaluador" });
      }

      const _docente = await Docente.findOne({usuario: uid})
      if(!_docente)  
          return res.status(401).json({ error: "No existe el docente" });

      const {
          docente,
          niveles,
          categorias,
          sede,
          antecedentes,
      } = req.body;

      const feriaActiva = await getFeriaActivaFuncion();
      if(!feriaActiva)
          return res.status(401).json({ error: "No existe una feria activa en este momento" });

      const postulacion = await Evaluador.findOne({idDocente: _docente._id, feria: feriaActiva._id})
      if(postulacion)
          return res.status(403).json({ error: "Este usuario ya se ha postulado como evaluador en esta feria" });

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
};


export const getPostulaciones = async (req, res) => {
  try {
    const postulaciones = await Evaluador.find({ pendiente: true })
    .select('-__v -id_carpeta_cv')
    .lean()
    .exec();

    if (postulaciones.length === 0) {
      return res
        .status(204)
        .json({ error: "No se han encontrado postulaciones pendientes" });
    }

    const postulacionesConDatosDocenteEstablecimiento = await Promise.all(
      postulaciones.map(async (postulacion) => {
        const datos_docente = await Docente.findById(postulacion.idDocente)
        .select('-__v -_id')
        .lean()
        .exec();

        const datos_establecimiento = await EstablecimientoEducativo.findOne({_id: postulacion.sede})
        .select('-__v -_id')
        .lean()
        .exec();

        return {
          ...postulacion,
          datos_docente: datos_docente,
          datos_establecimiento: datos_establecimiento,
        };
      })
    );

    return res.json({ postulaciones: postulacionesConDatosDocenteEstablecimiento });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const getPostulacionById = async (req, res) => {
  try {
    const {id} = req.params;

    const postulacion = await Evaluador.findById(id)
      .select('-__v -id_carpeta_cv')
      .lean()
      .exec();

    if (!postulacion) {
      return res
        .status(204)
        .json({ error: "No se han encontrado la postulación pendiente con el ID ingresado" });
    }

    const datos_docente = await Docente.findOne({_id: postulacion.idDocente})
      .select('-__v -_id')
      .lean()
      .exec();

    if (!datos_docente) {
      return res
        .status(401)
        .json({ error: "No existen los datos de docente asociados a la postulación" });
    }

    const datos_establecimiento = await EstablecimientoEducativo.findOne({_id: postulacion.sede})
      .select('-__v -_id')
      .lean()
      .exec();

    if (!datos_establecimiento) {
      return res
        .status(401)
        .json({ error: "No existen los datos la sede asociada a la postulación" });
    }

    postulacion.datos_docente = datos_docente;
    postulacion.datos_establecimiento = datos_establecimiento;

    return res.json({ postulacion });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


export const seleccionarEvaluadores = async (req, res) => {
  try {
    const { postulaciones } = req.body;

    for (const idSeleccionado of postulaciones) {
      const postulacion = await Evaluador.findById(idSeleccionado);
      if (!postulacion)
        return res.status(401).json({ error: "No existe la postulación" });

      const docente = await Docente.findById(postulacion.idDocente);
      if (!docente)
        return res
          .status(401)
          .json({ error: "No existe el docente asociado a la postulación" });

      const usuario = await Usuario.findById(docente.usuario);
      if (!usuario)
        return res
          .status(401)
          .json({ error: "No existe el usuario asociado al docente" });

      if (!usuario.roles.includes(roles.evaluador)) {
        usuario.roles.push(roles.evaluador);
        postulacion.pendiente = false;

        usuario.save();
        postulacion.save();
        
        try {   
            await emailCola.add("email:seleccionEvaluador", {
                usuario, 
                docente})

        } catch (error) {
            return res.status(500).json({ error: "Error de servidor" });
        }

      } else {
          return res.status(403).json({ error: "Este usuario ya posee el rol de evaluador" });
      }

    }
      
    return res.json({ ok: true,  responseMessage: "Se han añadido todas las tareas a la cola de envío de mail"});

    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


export const cargarCv = async (req, res) => {
  try {
    const uid = req.uid;
    const _docente = await Docente.findOne({ usuario: uid });
    const evaluador = await Evaluador.findOne({ idDocente: _docente.id });
    if (!_docente) {
      return res.status(401).json({ message: "NO EXISTE EL DOCENTE" });
    }else if(evaluador.id_carpeta_cv){
      res.status(400).json({
        message: "ERROR, YA EXISTE UNA CARPETA DE DRIVE ASOCIADA A ESTE EVALUADOR, DEBE ACTUALIZAR EL CV, NO INTENTAR CARGARLO POR PRIMERA VEZ."
      })
    }else{
      const form = formidable({ multiples: false });

      form.parse(req, async (err, fields, files) => {
  
        if (err) {
          console.error("ERROR EN FORM DATA AL PROCESARLO", err.message);
          res.status(500).send("ERROR AL PROCESAR EL FORM DATA");
          return;
        }
  
        if(!files.cv){
          return res.status(400).json({
            msg: "DEBE INGRESAR EL ARCHIVO PDF LLAMADO 'cv' ",
          });
        }
  
        //falta incorporar el === 0 object
        if (!files || Object.keys(files).length === 0) {
          return res.status(400).json({
            msg: "DEBE INGRESAR ARCHIVOS PDF, NO HA INGRESADO NADA.",
          });
        }
  
        const extensionValida = "application/pdf";
        for (const archivoKey in files) {
          if (files.hasOwnProperty(archivoKey)) {
            const archivo = files[archivoKey];
            if(archivo.mimetype !== extensionValida)
            return res.status(400).json({message: "ERROR, DEBE INGRESAR SOLO ARCHIVOS EN FORMATO PDF!"})
          }
        }
  
        const cola = await fileCv.add({uid , files});
        if(cola){
          console.log(cola);
          res.status(200).json({message: "CV CARGANDOSE..."});
        }else{
          res.status(400).json({message: "ERROR AL INTENTAR CARGAR EL CV"});
        }
  
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ERROR AL CARGAR EL CV - ERROR DEL SERVIDOR",
    });
  }
};

export const getCv = async(req, res) => {
  try {
    const id = req.params.id;
    const evaluador = await Evaluador.findById(id);
    if(evaluador){
      await downloadCv(drive , evaluador.CV , res);
    }



  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ERROR AL DESCARGAR EL CV - ERROR DEL SERVIDOR",
    });
  }
}

export const getCvV2 = async(req, res) => {
  try {
    const id = req.params.id;
    const evaluador = await Evaluador.findById(id);
    
    if(evaluador){
      await downloadCvTwo(drive , evaluador.CV , res);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ERROR AL DESCARGAR EL CV - ERROR DEL SERVIDOR",
    });
  }
}
export const getCv_ = async(req, res) => {
  try {
    const id = req.params.id;
    const evaluador = await Evaluador.findById(id);
    if(evaluador){
      await download_Cv(drive , evaluador.CV , res);
    }



  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ERROR AL DESCARGAR EL CV - ERROR DEL SERVIDOR",
    });
  }
}


export const obtenerInfoResumidaEvaluador = async (req, res) => {
  try {

      const uid = req.uid;
      const feriaActiva = await getFeriaActivaFuncion()

      const docente = await Docente.findOne({usuario: uid})
      if(!docente){
          return res.status(401).json({ error: "No existe un docente asociado a la sesión actual" });
      }

      const ev = await Evaluador.findOne({idDocente: docente._id})
      if(!ev){
          return res.status(401).json({ error: "No existe un evaluador asociado a la sesión actual" });
      }

      const proyectos_asignados = await Proyecto.find({evaluadoresRegionales: { $in: [ev._id] }, feria: feriaActiva._id, estado: {$nin: [estado.finalizado, estado.inactivo]}})
          .select('_id titulo estado')
          .lean()
          .exec()

      const cant_proyectos_asignados = proyectos_asignados.length;
      const proyectos_pendientes_regional = proyectos_asignados.filter(proyecto => proyecto.estado == estado.instanciaRegional || proyecto.estado == estado.enEvaluacionRegional);
      const cant_proyectos_pendientes_regional = proyectos_pendientes_regional.length;
      const proyectos_pendientes_provincial = proyectos_asignados.filter(proyecto => proyecto.estado == estado.promovidoProvincial || proyecto.estado == estado.enEvaluacionProvincial);
      const cant_proyectos_pendientes_provincial = proyectos_pendientes_provincial.length;


      const {instancia_actual, prox_instancia} = obtenerFaseFeria(parseInt(feriaActiva.estado));
      const prox_fecha = convertirFecha(eval(`feriaActiva.${obtenerProximaFecha(parseInt(feriaActiva.estado))}`))

      let evaluador;
      if(parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_ExposicionFinalizada)) {
        evaluador = {
            prox_instancia,
            instancia_actual,
            prox_fecha,
            cant_proyectos_asignados,
            cant_proyectos_pendientes: cant_proyectos_pendientes_regional,
            proyectos_asignados
          }
      } else {
        evaluador = {
            prox_instancia,
            instancia_actual,
            prox_fecha,
            cant_proyectos_asignados,
            cant_proyectos_pendientes: cant_proyectos_pendientes_provincial,
            proyectos_asignados
          }
      }

      return res.json({evaluador})

  } catch (error) {
      console.log(error)
      return res.status(500).json({error: "Error de servidor"})
  }
}