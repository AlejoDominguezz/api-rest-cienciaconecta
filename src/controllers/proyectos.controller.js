import { Proyecto, estado, nombreEstado } from "../models/Proyecto.js";
import { Docente } from "../models/Docente.js";
import { Usuario } from "../models/Usuario.js";
import { drive } from "../services/drive/drive.js";
import {
  createFolder,
  shareFolderWithPersonalAccount,
  sendFileToDrive,
  deleteFile,
  getIdByUrl,
  obtenerIDsDeArchivosEnCarpeta,
  downloadFiles,
  DownloadFileByUrl,
  getFileNameById
} from "../services/drive/helpers-drive.js";
import formidable from "formidable";
import { existeProyecto } from "../helpers/db-validar.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";
import { Feria, estadoFeria } from "../models/Feria.js";
import { roles } from "../helpers/roles.js";
import multer from "multer";
import QRCode from 'qrcode'
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg  from 'jpeg-js';
import sharp from 'sharp';
import {filesCola} from "../helpers/queueManager.js";
import { Nivel } from "../models/Nivel.js";
import { Categoria } from "../models/Categoria.js";
import { generarNotificacion, tipo_notificacion } from "../helpers/generarNotificacion.js";


// Configurar multer para manejar la subida de archivos
const storage = multer.memoryStorage(); // Almacenar los archivos en la memoria
const upload = multer({ storage: storage });

export const inscribirProyectoEscolar = async (req, res) => {
  const {
    titulo,
    descripcion,
    nivel,
    categoria,
    establecimientoEducativo,
    emailEscuela,
  } = req.body;

  try {
    const errorExisteProyecto = await existeProyecto(titulo);
    if (errorExisteProyecto) {
      return res.status(400).json(errorExisteProyecto); // Devuelves el mensaje de error en formato JSON
    }

    const uid = req.uid;
    
    
    const usuario = await Usuario.findById(uid);
    if (usuario.roles.includes(roles.refEvaluador)){
      return res.status(403).json({ error: "Un usuario referente de evaluador no puede inscribir proyectos" });
    }

    const responsable = await Docente.findOne({ usuario: uid });
    if (!responsable){
      return res
        .status(401)
        .json({ error: "No existe el docente correspondiente a su usuario" });
    }

    const feriaActiva = await Feria.findOne({
      estado: { $ne: estadoFeria.finalizada },
    });
    if (!feriaActiva)
      return res
        .status(401)
        .json({ error: "No existe una feria activa en este momento" });

    const proyecto = new Proyecto({
      titulo,
      descripcion,
      nivel,
      categoria,
      establecimientoEducativo,
      emailEscuela,
      idResponsable: responsable._id,
      feria: feriaActiva,
    });

    await proyecto.save();

    await generarNotificacion(uid, tipo_notificacion.inscripcion(proyecto.titulo))

    // Cambio estado del usuario: de docente a responsable de proyecto
    if (!usuario.roles.includes(roles.responsableProyecto))
      usuario.roles.push(roles.responsableProyecto);
    await usuario.save();

    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

export const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });

    // Para quitar el rol de responsable, si no tiene más proyectos: busco si tiene proyectos
    const tieneProyectos = await Proyecto.findOne({
      idResponsable: proyecto.idResponsable,
      _id: { $ne: proyecto._id }, // Excluye el proyecto actual por su ID
      estado: { $nin: [estado.inactivo, estado.finalizado] }, // No incluye proyectos con estado "inactivo" o "finalizado"
    });

    // Si no tiene proyectos, elimino el rol de responsable
    if (!tieneProyectos) {
      const docente = await Docente.findOne({ id: proyecto.idResponsable });
      const usuario = await Usuario.findById(docente.usuario);

      const indiceRol = usuario.roles.indexOf(roles.responsableProyecto);
      if (indiceRol !== -1) {
        usuario.roles.splice(indiceRol, 1);
        await usuario.save();
      }
    }

    await proyecto.deleteOne();

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const bajaProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });

    const proyectoInactivo =
      proyecto.estado === estado.inactivo ||
      proyecto.estado === estado.finalizado;
    console.log(proyectoInactivo);
    if (proyectoInactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ya se encuentra inactivo" });

    proyecto.estado = estado.inactivo;

    // Para quitar el rol de responsable, si no tiene más proyectos: busco si tiene proyectos
    const tieneProyectos = await Proyecto.findOne({
      idResponsable: proyecto.idResponsable,
      _id: { $ne: proyecto._id }, // Excluye el proyecto actual por su ID
      estado: { $nin: [estado.inactivo, estado.finalizado] }, // No incluye proyectos con estado "inactivo" o "finalizado"
    });

    // Si no tiene proyectos, elimino el rol de responsable
    if (!tieneProyectos) {
      const docente = await Docente.findById(proyecto.idResponsable);
      const usuario = await Usuario.findById(docente.usuario);

      const indiceRol = usuario.roles.indexOf(roles.responsableProyecto);
      if (indiceRol !== -1) {
        usuario.roles.splice(indiceRol, 1);
        await usuario.save();
      }
    }

    await proyecto.save();

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const modificarProyectoEscolar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      establecimientoEducativo,
      emailEscuela,
    } = req.body;

    let proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });
    if (proyecto.estado === estado.inactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ha sido dado de baja" });

    if (titulo && titulo !== proyecto.titulo) {
      const errorExisteProyecto = await existeProyecto(titulo);
      if (errorExisteProyecto) {
        return res.status(400).json(errorExisteProyecto); // Devuelves el mensaje de error en formato JSON
      }
    }

    proyecto.titulo = titulo ?? proyecto.titulo;
    proyecto.descripcion = descripcion ?? proyecto.descripcion;
    proyecto.nivel = nivel ?? proyecto.nivel;
    proyecto.categoria = categoria ?? proyecto.categoria;
    proyecto.establecimientoEducativo =
      establecimientoEducativo ?? proyecto.establecimientoEducativo;
    proyecto.emailEscuela = emailEscuela ?? proyecto.emailEscuela;

    await proyecto.save();

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const consultarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });
    if (proyecto.estado === estado.inactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ha sido dado de baja" });

    const establecimiento = await EstablecimientoEducativo.findOne({
      _id: proyecto.establecimientoEducativo,
    });
    if (!establecimiento)
      return res.status(401).json({
        error:
          "No existe el establecimiento educativo correspondiente al proyecto",
      });

    // Agrega el nombre del estado y lo devuelve en el json de la consulta
    const proyectoConNombreEstado = {
      ...proyecto.toObject(),
      establecimientoEducativo: establecimiento,
      nombreEstado: nombreEstado[proyecto.estado],
    }; // Obtenemos el nombre del estado según la clave;

    return res.json({ proyecto: proyectoConNombreEstado });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const consultarProyectos = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      establecimientoEducativo,
      emailEscuela,
      idResponsable,
      fechaInscripcion,
      feria,
      estado,
      videoPresentacion,
      registroPedagogico,
      carpetaCampo,
      informeTrabajo,
      sede,
      autorizacionImagen,
    } = req.query;

    // Crear un objeto de filtro con los parámetros de consulta presentes
    const filtro = {
      ...(titulo && { titulo }),
      ...(descripcion && { descripcion }),
      ...(nivel && { nivel }),
      ...(categoria && { categoria }),
      ...(establecimientoEducativo && { establecimientoEducativo }),
      ...(emailEscuela && { emailEscuela }),
      ...(idResponsable && { idResponsable }),
      ...(fechaInscripcion && { fechaInscripcion }),
      ...(feria && { feria }),
      ...(estado && { estado }),
      ...(videoPresentacion && { videoPresentacion }),
      ...(registroPedagogico && { registroPedagogico }),
      ...(carpetaCampo && { carpetaCampo }),
      ...(informeTrabajo && { informeTrabajo }),
      ...(sede && { sede }),
      ...(autorizacionImagen && {
        autorizacionImagen: autorizacionImagen === "true",
      }),
    };
    const proyectos = await Proyecto.find(filtro);

    if (proyectos.length === 0)
      return res.status(204).json({ error: "No se han encontrado proyectos" });

    // Agrega el nombre del estado y establecimiento, y lo devuelve en el json de la consulta
    const proyectosModificado = await Promise.all(
      proyectos.map(async (proyecto) => {
        // Busca el establecimiento educativo para cada proyecto
        const establecimientoProyecto = await EstablecimientoEducativo.findOne({
          _id: proyecto.establecimientoEducativo,
        });

        if (!establecimientoProyecto) {
          return {
            ...proyecto.toObject(),
            establecimientoEducativo: null, // O puedes manejarlo de otra manera si el establecimiento no se encuentra
            nombreEstado: nombreEstado[proyecto.estado],
          };
        }

        return {
          ...proyecto.toObject(),
          establecimientoEducativo: establecimientoProyecto,
          nombreEstado: nombreEstado[proyecto.estado],
        };
      })
    );

    return res.json({proyectos: proyectosModificado})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const consultarMisProyectos = async (req, res) => {
  try {
    const uid = req.uid;

    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      establecimientoEducativo,
      emailEscuela,
      idResponsable,
      fechaInscripcion,
      feria,
      estado,
      videoPresentacion,
      registroPedagogico,
      carpetaCampo,
      informeTrabajo,
      sede,
      autorizacionImagen,
    } = req.query;

    const responsable = await Docente.findOne({ usuario: uid });
    if (!responsable)
      return res
        .status(401)
        .json({ error: "No existe el docente correspondiente a su usuario" });

    // Crear un objeto de filtro con los parámetros de consulta presentes
    const filtro = {
      ...(titulo && { titulo }),
      ...(descripcion && { descripcion }),
      ...(nivel && { nivel }),
      ...(categoria && { categoria }),
      ...(establecimientoEducativo && { establecimientoEducativo }),
      ...(emailEscuela && { emailEscuela }),
      ...(idResponsable && { idResponsable }),
      ...(fechaInscripcion && { fechaInscripcion }),
      ...(feria && { feria }),
      ...(estado && { estado }),
      ...(videoPresentacion && { videoPresentacion }),
      ...(registroPedagogico && { registroPedagogico }),
      ...(carpetaCampo && { carpetaCampo }),
      ...(informeTrabajo && { informeTrabajo }),
      ...(sede && { sede }),
      ...(autorizacionImagen && {
        autorizacionImagen: autorizacionImagen === "true",
      }),
      idResponsable: responsable._id,
    };

    const proyectos = await Proyecto.find(filtro);

    if (proyectos.length === 0)
      return res.status(204).json({ error: "No se han encontrado proyectos" });

    // Agrega el nombre del estado y establecimiento, y lo devuelve en el json de la consulta
    const proyectosModificado = await Promise.all(
      proyectos.map(async (proyecto) => {
        // Busca el establecimiento educativo para cada proyecto
        const establecimientoProyecto = await EstablecimientoEducativo.findOne({
          _id: proyecto.establecimientoEducativo,
        });

        if (!establecimientoProyecto) {
          return {
            ...proyecto.toObject(),
            establecimientoEducativo: null, // O puedes manejarlo de otra manera si el establecimiento no se encuentra
            nombreEstado: nombreEstado[proyecto.estado],
          };
        }

        return {
          ...proyecto.toObject(),
          establecimientoEducativo: establecimientoProyecto,
          nombreEstado: nombreEstado[proyecto.estado],
        };
      })
    );

    return res.json({ proyectos: proyectosModificado });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

// export const actualizarProyectoRegional = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       videoPresentacion,
//       registroPedagogico,
//       carpetaCampo,
//       informeTrabajo,
//       sede,
//       autorizacionImagen,
//       grupoProyecto,
//     } = req.body;

//     let proyecto = await Proyecto.findById(id);
//     if (!proyecto)
//       return res.status(404).json({ error: "No existe el proyecto" });
//     if (proyecto.estado === estado.inactivo)
//       return res
//         .status(404)
//         .json({ error: "El proyecto ha sido dado de baja" });
//     if (proyecto.estado === estado.instanciaRegional)
//       return res
//         .status(404)
//         .json({
//           error:
//             "El proyecto ya ha sido actualizado a etapa regional. Aún puede modificar los datos de proyecto",
//         });

//     let existeSede = await Sede.findById(sede);
//     if (!existeSede)
//       return res.status(404).json({ error: "No existe la sede" });

//     if (!autorizacionImagen)
//       return res
//         .status(404)
//         .json({
//           error:
//             "Para continuar, debe autorizar el uso y cesión de imagen de los estudiantes",
//         });

//     proyecto.videoPresentacion = videoPresentacion ?? proyecto.videoPresentacion;
//     proyecto.registroPedagogico = registroPedagogico ?? proyecto.registroPedagogico;
//     proyecto.carpetaCampo = carpetaCampo ?? proyecto.carpetaCampo;
//     proyecto.informeTrabajo = informeTrabajo ?? proyecto.informeTrabajo;
//     proyecto.sede = sede ?? proyecto.sede;
//     proyecto.autorizacionImagen = autorizacionImagen ?? proyecto.autorizacionImagen;
//     proyecto.grupoProyecto = grupoProyecto ?? proyecto.grupoProyecto;

//     proyecto.estado = estado.instanciaRegional;

//     await proyecto.save();

//     return res.json({ proyecto });
//   } catch (error) {
//     console.log(error);
//     if (error.kind === "ObjectId")
//       return res.status(403).json({ error: "Formato ID incorrecto" });
//     res.status(500).json({ error: "Error de servidor" });
//   }
// };

export const modificarProyectoRegional = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      establecimientoEducativo,
      emailEscuela,
      videoPresentacion,
      // registroPedagogico,
      // carpetaCampo,
      // informeTrabajo,
      sede,
      // autorizacionImagen,
      grupoProyecto,
    } = req.body;

    const proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });

    if (proyecto.estado === estado.inactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ha sido dado de baja" });

    if (titulo && titulo !== proyecto.titulo) {
      const errorExisteProyecto = await existeProyecto(titulo);
      if (errorExisteProyecto) {
        return res.status(400).json(errorExisteProyecto);
      }
    }

    proyecto.titulo = titulo ?? proyecto.titulo;
    proyecto.descripcion = descripcion ?? proyecto.descripcion;
    proyecto.nivel = nivel ?? proyecto.nivel;
    proyecto.categoria = categoria ?? proyecto.categoria;
    proyecto.establecimientoEducativo =
      establecimientoEducativo ?? proyecto.establecimientoEducativo;
    proyecto.emailEscuela = emailEscuela ?? proyecto.emailEscuela;

    proyecto.videoPresentacion = videoPresentacion ?? proyecto.videoPresentacion;
    // proyecto.registroPedagogico =
    //   registroPedagogico ?? proyecto.registroPedagogico;
    // proyecto.carpetaCampo = carpetaCampo ?? proyecto.carpetaCampo;
    // proyecto.informeTrabajo = informeTrabajo ?? proyecto.informeTrabajo;
    proyecto.sede = sede ?? proyecto.sede;
    // proyecto.autorizacionImagen =
    //   autorizacionImagen ?? proyecto.autorizacionImagen;
    proyecto.grupoProyecto = grupoProyecto ?? proyecto.grupoProyecto;

    if (proyecto.estado === estado.instanciaEscolar)
      proyecto.estado = estado.instanciaRegional;

    await proyecto.save();

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const cargarArchivosRegional = async (req, res) => {
  //obtengo el id del proyecto
  const uid = req.uid;
  const id_proyecto = req.params.id;
  const proyecto = await Proyecto.findById(id_proyecto);

  try {
    if(!proyecto.id_carpeta_drive){
      //console.log('no existe la carpeta')
      //logica para cargar por primera vez los documents
      const form = formidable({ multiples: false });
      form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error al form-data", err.message);
        res.status(500).send("Error al procesar el form-data");
        return;
      }
      if (!files) {
        return res.status(400).json({
          msg: "Error, debe ingresar los archivos pdfs! no ha ingresado nada!",
        });
      }
      const extensionValida = "application/pdf";
      const archivosNoPDF = [];
      const requiredFiles = [
        "carpetaCampo",
        "registroPedagogicopdf",
        "informeTrabajo",
        "autorizacionImagen",
      ];

      const archivos_input = files;
      // Obtener los nombres de los archivos subidos
      const nombresArchivos = Object.keys(archivos_input);

      for (const fieldName of requiredFiles) {
        if (!nombresArchivos.includes(fieldName)) {
          res.status(400).json({
            msg: `Falta el archivo con el nombre: ${fieldName} , ingresarlo!`,
          });
          return;
        }

        const archivo = archivos_input[fieldName];
        if (archivo.mimetype !== extensionValida) {
          archivosNoPDF.push(fieldName);
        }
      }
      // // Verificar si se subió un archivo con el campo "archivoPDF"
      if (archivosNoPDF.length > 0) {
        return res.status(400).json({
          msg: `Los archivos ingresados tienen que tener formato pdf!! revisar: ${archivosNoPDF}`,
        });
      }
      const name_files = [];
      if (files.carpetaCampo) {
        name_files.push({ file: 'carpetaCampo', name: files.carpetaCampo.originalFilename });
      }
      if (files.informeTrabajo) {
        name_files.push({ file: 'informeTrabajo', name: files.informeTrabajo.originalFilename });
      }
      if (files.registroPedagogicopdf) {
        name_files.push({ file: 'registroPedagogicopdf', name: files.registroPedagogicopdf.originalFilename });
      }
      if (files.autorizacionImagen) {
        name_files.push({ file: 'autorizacionImagen', name: files.autorizacionImagen.originalFilename });
      }

      proyecto.nameCarpetaCampo = "Cargando...";
      proyecto.nameAutorizacionImagen = "Cargando...";
      proyecto.nameRegistroPedagogicopdf = "Cargando...";
      proyecto.nameInformeTrabajo = "Cargando...";

      await proyecto.save();
      const cola = await filesCola.add("files_:upload", { 
        uid: uid,
        id: id_proyecto, 
        files: files,
        name_files: name_files});

      if(cola){
        res.status(200).json({message:"ARCHIVOS CARGANDOSE, VERIFIQUE LA CARGA."});
      }else{
        res.status(400).json({message:"ERROR AL INTENTAR SUBIR LOS ARCHIVOS."});
      }
      });

    }else{
      //logica para modificar documents
      //console.log('existe carpeta');
      const id = id_proyecto;
      const form = formidable({ multiples: false });
      form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error al form-data", err.message);
        res.status(500).send("Error al procesar el form-data");
        return;
      }
      if (!files) {
        return res.status(400).json({
          msg: "Error, debe ingresar los archivos pdfs! no ha ingresado nada!",
        });
      }

      const extensionValida = "application/pdf";
      for (const archivoKey in files) {
        if (files.hasOwnProperty(archivoKey)) {
          const archivo = files[archivoKey];
          if(archivo.mimetype !== extensionValida)
          return res.status(400).json({message: "ERROR, DEBE INGRESAR ARCHIVOS EN FORMATO PDF!"})
        }
      }

      const name_files = [];

      if (files.carpetaCampo) {
        proyecto.nameCarpetaCampo = "Cargando...";
      }
      
      if (files.informeTrabajo) {
        proyecto.nameInformeTrabajo = "Cargando...";
      }
      
      if (files.registroPedagogicopdf) {
        proyecto.nameRegistroPedagogicopdf = "Cargando...";
      }
      
      if (files.autorizacionImagen) {
        proyecto.nameAutorizacionImagen = "Cargando...";
      }
      
      await proyecto.save();
      const cola = await filesCola.add("files_:update", { 
        uid: uid,
        id: id, 
        files: files,
        name_files: name_files});

      if(cola){
        res.status(200).json({message:"ARCHIVOS ACTUALIZANDOSE, VERIFIQUE LA CARGA."});
      }else{
        res.status(400).json({message:"ERROR AL INTENTAR ACTUALIZAR LOS ARCHIVOS."});
      }

    });

    }
    

  } catch (error) {
    console.error(error);
    res.status(400).json({
      msg: "Error al enviar archivos a drive!!! ",
    });
  }
};

export const downloadDocuments = async(req , res) => {
  try {
    const id = req.params.id;
    const proyecto = await Proyecto.findById(id);
    const folder_id = proyecto.id_carpeta_drive;
    if(folder_id){
      //buscar archivos pdfs!
      const ids = await obtenerIDsDeArchivosEnCarpeta(folder_id , drive);
      if(ids && ids.length > 0){

        // Recorrer los IDs de archivos y descargar cada uno
        const descargasPromesas = ids.map(fileId => downloadFiles(fileId, drive));
        // Ejecutar las descargas en paralelo
        const archivos = await Promise.all(descargasPromesas);
        
        // Devolver los archivos al cliente
        res.status(200).json({ archivos });
      }else{
        res.status(400).json({message: "NO EXISTEN ARCHIVOS DENTRO DE LA CARPETA."})
      }
    }else{
      res.status(400).json({message: "NO EXISTE CARPETA DE DRIVE ASOCIADA A ESTE PROYECTO."})
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "ERROR AL OBTENER LOS DOCUMENTOS DEL PROYECTO."})
  }
}

export const downloadDocumentEspecific = async (req, res) => {
  try {
    const { id, name } = req.params;

    // Valida que 'name' sea uno de los valores permitidos
    const allowedNames = ["carpetaCampo", "informeTrabajo", "registroPedagogico" , "autorizacionImagen"];
    if (!allowedNames.includes(name)) {
      return res.status(400).json({ message: "Nombre no válido: " + name + "; Debe ingresar alguno de estos: " , allowedNames });
    }

    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      return res.status(400).json({ message: "ERROR, EL PROYECTO NO EXISTE." });
    }
    let id_file;
    const downloadFile = async (name, project, drive, res) => {
      const fileUrl = project[name];
      if (fileUrl) {
        id_file = await getIdByUrl(fileUrl);
        if (id_file) {
          await DownloadFileByUrl(drive, id_file, res, name);
        } else {
          return res.status(400).json({ message: `ERROR AL OBTENER EL ID DEL ${name.toUpperCase()} DEL PROYECTO` });
        }
      } else {
        return res.status(400).json({ message: `ERROR DESCONOCIDO AL DESCARGAR EL ${name.toUpperCase()} DEL DOCUMENTO` });
      }
    };
    
    if (name === "carpetaCampo" || name === "informeTrabajo" || name === "autorizacionImagen" || name === "registroPedagogico") {
      await downloadFile(name, proyecto, drive, res);
    } else {
      return res.status(400).json({ message: "ERROR DESCONOCIDO AL DESCARGAR EL DOCUMENTO" });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ERROR AL DESCARGAR EL CV - ERROR DEL SERVIDOR",
    });
  }
};



const generarQR = async (proyecto) => {
  return new Promise((resolve, reject) => {
    const urlEvaluacion = `${process.env.URL_FRONT}/${process.env.ENDPOINT_EVALUACION}/${proyecto._id}`;

    // Genera el código QR con la URL
    QRCode.toDataURL(urlEvaluacion, { type: 'image/png' }, async (err, url) => {
      if (err) {
        reject('Error al generar el QR');
        return;
      }

      try {
        // Usa sharp para cargar la imagen y convertirla a formato PNG
        const qrBuffer = await sharp(Buffer.from(url.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
          .toFormat('png')
          .toBuffer();

        // Convierte el buffer a una cadena base64 para almacenarlo en el atributo QR
        const qrBase64 = qrBuffer.toString('base64');

        // Almacena el código QR como cadena base64 en el atributo QR del proyecto
        proyecto.QR = qrBase64;

        // Guarda el proyecto con el atributo QR actualizado
        await proyecto.save();

        // Resuelve la promesa con el proyecto actualizado
        resolve(proyecto);
      } catch (error) {
        reject('Error al generar o guardar el QR');
        console.log(error)
      }
    });
  });
};




export const generarPDFconQR = async (req, res) => {
  try {
    let proyecto = req.proyecto;

    if(!proyecto?.QR) {
      proyecto = await generarQR(proyecto)
    }

    // Crea un nuevo documento PDF con el formato A4 (595 puntos de ancho x 842 puntos de alto)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]);

    // Decodificar el código QR en formato base64
    const qrBase64 = proyecto.QR;

    // Convierte la cadena base64 a un buffer
    const qrBuffer = Buffer.from(qrBase64, 'base64');

    // Agrega el código QR al PDF
    const qrImage = await pdfDoc.embedPng(qrBuffer); // Usar embedPng para una imagen PNG
    const qrDims = qrImage.scale(2);

    const pageDims = page.getSize();

    // Calcula la posición para centrar el QR en la página
    const qrX = (pageDims.width - qrDims.width) / 2;
    const qrY = (pageDims.height - qrDims.height) / 2;

    // Dibuja el código QR en el centro de la página
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrDims.width,
      height: qrDims.height,
    });

    const title = proyecto.titulo.replace(/\n/g, ' '); // Reemplazar las nuevas líneas con espacios

    // Dividir el título en líneas de no más de 30 caracteres
    const maxLineLength = 30;
    const titleLines = [];
    let currentLine = '';

    for (let i = 0; i < title.length; i++) {
      currentLine += title[i];
      if (currentLine.length >= maxLineLength || i === title.length - 1) {
        titleLines.push(currentLine);
        currentLine = '';
      }
    }

    // Calcular la posición y para centrar el título
    const titleY = qrY + 450; // La posición inicial de Y

    const fontSize = 20; // Tamaño del título
    const font = await pdfDoc.embedFont('Helvetica');
    
    // Dibuja cada línea del título centrada en la página
    for (let i = 0; i < titleLines.length; i++) {
      const line = titleLines[i];
      
      // Calcular el ancho de la línea actual
      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      
      // Calcular la posición x para centrar la línea actual
      const lineX = qrX + (qrDims.width - lineWidth) / 2;
      
      // Dibuja la línea centrada en la página
      page.drawText(line, {
        x: lineX,
        y: titleY - i * fontSize, // Posición de Y ajustada para cada línea
        size: fontSize, // Tamaño del título
        color: rgb(0, 0, 0), // Color negro
        font: font, // La fuente que estás utilizando
      });
    }

    // Serializa el PDF en un ArrayBuffer
    const pdfBytes = await pdfDoc.save();

    // Obtener ruta del directorio actual
    const currentDir = path.dirname(fileURLToPath(import.meta.url));

    // Crea un archivo temporal para almacenar el PDF
    const tempFilePath = path.join(currentDir, '../temp', `temp-qr-${proyecto._id}.pdf`).replace(/\\/g, '/');

    // Utiliza promesas para escribir el archivo
    await new Promise((resolve, reject) => {
      fs.writeFile(tempFilePath, pdfBytes, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Envía el PDF como una respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Proyecto - ${proyecto.titulo}.pdf`);
    //res.status(200).sendFile(tempFilePath);

    // Envía el archivo como respuesta
    res.status(200).sendFile(tempFilePath, async (err) => {
      if (!err) {
        try {
          // Elimina el archivo temporal después de enviarlo como respuesta

          await deleteTemporaryFile(tempFilePath);
        } catch (error) {
          console.error('Error al eliminar el archivo temporal', error);
        }
      } else {
        res.status(500).json({ error: 'Error al enviar el archivo como respuesta' });
      }
    });

    // Eliminar archivo temporal
    const deleteTemporaryFile = (filePath) => {
      return new Promise((resolve, reject) => {
        // Elimina el archivo
        fs.unlink(filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };

  } catch (error) {
    console.error('Error al generar el PDF', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
};




export const obtenerInfoResumidaProyecto = async (req, res) => {
  try {
    const {id} = req.params;
    const proyecto = await Proyecto.findById(id)
      .select('-__v -emailEscuela -idResponsable -fechaInscripcion -feria -estado -sede -autorizacionImagen -id_carpeta_drive -evaluadoresRegionales -QR -_id -grupoProyecto._id -grupoProyecto.dni -carpetaCampo -informeTrabajo -registroPedagogico')
      .lean()
      .exec()    

    if(!proyecto){
      return res.status(404).json({error: "No existe el proyecto con el ID ingresado"})
    }

    const nivel = await Nivel.findById(proyecto.nivel)
    if(!nivel) {
      return res.status(404).json({error: "No existe el nivel del proyecto ingresado"})
    }
    proyecto.nivel = nivel.nombre;

    const categoria = await Categoria.findById(proyecto.categoria)
    if(!categoria) {
      return res.status(404).json({error: "No existe la categoria del proyecto ingresado"})
    }
    proyecto.categoria = categoria.nombre;

    const establecimiento = await EstablecimientoEducativo.findById(proyecto.establecimientoEducativo)
    if(!establecimiento) {
      return res.status(404).json({error: "No existe el establecimiento del proyecto ingresado"})
    }
    proyecto.establecimientoEducativo = establecimiento.nombre;

    return res.json({proyecto})

  } catch (error) {
    return res.status(500).json({error: "Error de servidor"})
  }
}


export const consultarDocuments = async (req, res) => {
  try {
    const id_proy = req.params.id;

    const enCola = await filesCola.getJobs(['waiting', 'active'], 0, -1, 'desc');
    const completados = await filesCola.getJobs(['completed'], 0, -1, 'desc');
    const fallidos = await filesCola.getFailed();

    // Combinar todos los trabajos en un solo array
    const todosLosTrabajos = enCola.concat(completados, fallidos);

    // Filtrar los trabajos cuyo ID coincida con el ID del proyecto
    const trabajosFiltrados = todosLosTrabajos.filter((trabajo) => trabajo.data.id === id_proy);

    // Comprobar si hay trabajos en progreso
    const enProgreso = trabajosFiltrados.some((trabajo) => trabajo.state === 'active');

    if (enProgreso) {
      // Si hay trabajos en progreso, devolver "in_progress"
      return res.json("in_progress");
    }

    // Comprobar si hay trabajos fallidos
    const hayFallas = fallidos.some((trabajo) => trabajo.data.id === id_proy);

    if (hayFallas) {
      // Si hay trabajos fallidos, devolver "falled"
      return res.json("falled");
    }

    // Ordenar los trabajos filtrados por timestamp en orden descendente
    trabajosFiltrados.sort((a, b) => b.timestamp - a.timestamp);

    // Obtener el último trabajo filtrado
    const ultimoTrabajo = trabajosFiltrados[0];

    return res.json(ultimoTrabajo.data.name_files || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'ERROR AL PROCESAR LA CONSULTA.' });
  }
};

