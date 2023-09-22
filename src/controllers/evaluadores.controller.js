import { Evaluador } from "../models/Evaluador.js";
import { Usuario } from "../models/Usuario.js";
import { Docente } from "../models/Docente.js";
import { Feria, estadoFeria } from "../models/Feria.js";
import { roles } from "../helpers/roles.js";
import { seleccionMailHtml } from "../helpers/seleccionMail.js";
import { transporter } from "../helpers/mailer.js";
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


export const postularEvaluador = async (req, res) => {
    try {

      const uid = req.uid;
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
    const postulaciones = await Evaluador.find({ pendiente: true });
    if (postulaciones.length === 0) {
      return res
        .status(204)
        .json({ error: "No se han encontrado postulaciones pendientes" });
    }

    const postulacionesConDatosDocente = await Promise.all(
      postulaciones.map(async (postulacion) => {
        const datos_docente = await Docente.findById(postulacion.idDocente);
        return {
          ...postulacion.toObject(),
          datos_docente: datos_docente.toObject(),
        };
      })
    );

    return res.json({ postulaciones: postulacionesConDatosDocente });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const seleccionarEvaluadores = async (req, res) => {
  try {
    const { postulaciones } = req.body;

    var falloMail = false;
    var errores = [];

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
          await enviarMailSeleccion(usuario, docente);
        } catch (error) {
          falloMail = true;
          errores.push(`Fallo en el envío de mail a ${usuario.email}`);
        }
      } else {
        return res
          .status(403)
          .json({ error: "Este usuario ya posee el rol de evaluador" });
      }
    }

    if (!falloMail) {
      return res.json({
        ok: true,
        responseMessage: "Se han enviado todos los emails correctamente",
      });
    } else {
      return res.json({ ok: true, responseMessage: errores });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

const enviarMailSeleccion = async (usuario, docente) => {
  try {
    await transporter.sendMail({
      from: "Ciencia Conecta",
      to: usuario.email,
      subject: "Resultado de Postulación como Evaluador",
      html: seleccionMailHtml(docente),
    });

    // Verificar si el correo se envió exitosamente
    if (info.accepted.length === 0) {
      // No se pudo enviar el correo
      throw new Error(`No se pudo enviar el correo a ${usuario.email}`);
    }
  } catch (error) {
    throw error;
  }
};

export const cargarCv = async (req, res) => {
  try {
    const uid = req.uid;
    const _docente = await Docente.findOne({ usuario: uid });
    const evaluador = await Evaluador.findOne({ idDocente: _docente.id });

    if (!_docente) {
      return res.status(401).json({ message: "NO EXISTE EL DOCENTE" });
    }
    if(evaluador.id_carpeta_cv){
      res.status(400).json({
        message: "ERROR, YA EXISTE UNA CARPETA DE DRIVE ASOCIADA A ESTE EVALUADOR, DEBE ACTUALIZAR EL CV, NO INTENTAR CARGARLO POR PRIMERA VEZ."
      })
    }

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

      const name_folder = _docente.cuil;
      //creo la nueva carpeta
      const id_folder_new = await createFolder(name_folder, drive);

      if (id_folder_new) {
        evaluador.id_carpeta_cv = id_folder_new;
        // Compartir la carpeta creada en paralelo
        const email_ciencia_conecta = "cienciaconecta.utn@gmail.com";
        await shareFolderWithPersonalAccount(
          id_folder_new,
          email_ciencia_conecta,
          drive,
          "writer"
        );
        const id_cv = await sendFileToDrive(files.cv, id_folder_new, drive);
        if (id_cv) {
          //https://drive.google.com/file/d/${id_cv}/preview
          evaluador.CV = `${id_cv}`;
          evaluador.save();
          return res.status(200).json({
            message: "CV CARGADO CORRECTAMENTE EN DRIVE",
          });
        } else {
          return res.status(400).json({
            message: "ERROR AL CARGAR EL CV EN DRIVE",
          });
        }
      } else {
        res.status(500).json({
          message: "ERROR AL CREAR LA CARPETA EN DRIVE",
        });
      }

    });
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