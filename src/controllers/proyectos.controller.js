import { Proyecto, estado, nombreEstado } from "../models/Proyecto.js";
import { Sede } from "../models/Sede.js";
import { Docente } from "../models/Docente.js";
import { Usuario } from "../models/Usuario.js";

import { drive } from "../services/drive/drive.js";
import {
  createFolder,
  shareFolderWithPersonalAccount,
  sendFileToDrive,
} from "../services/drive/helpers-drive.js";
import formidable from "formidable";

import { existeProyecto } from "../helpers/db-validar.js";


export const inscribirProyectoEscolar = async (req, res) => {
  const {
    titulo,
    descripcion,
    nivel,
    categoria,
    nombreEscuela,
    cueEscuela,
    privada,
    emailEscuela,
  } = req.body;

  try {

    
    const errorExisteProyecto = await existeProyecto(titulo);
    if (errorExisteProyecto) {
        return res.status(400).json(errorExisteProyecto); // Devuelves el mensaje de error en formato JSON
    }

    const uid = req.uid;
    const responsable = await Docente.findOne({ usuario: uid });
    const usuario = await Usuario.findById(uid);
    if (!responsable)
      return res
        .status(401)
        .json({ error: "No existe el docente correspondiente a su usuario" });

    const proyecto = new Proyecto({
      titulo,
      descripcion,
      nivel,
      categoria,
      nombreEscuela,
      cueEscuela,
      privada,
      emailEscuela,
      idResponsable: responsable._id,
    });

    await proyecto.save();

    // Cambio estado del usuario: de docente a responsable de proyecto
    if (!usuario.roles.includes("2")) usuario.roles.push("2");
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

    const proyectoInactivo = proyecto.estado === estado.inactivo || proyecto.estado === estado.finalizado
    console.log(proyectoInactivo)
    if(proyectoInactivo)
      return res.status(404).json({ error: "El proyecto ya se encuentra inactivo" });

    proyecto.estado = estado.inactivo;
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
      nombreEscuela,
      cueEscuela,
      privada,
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
    proyecto.nombreEscuela = nombreEscuela ?? proyecto.nombreEscuela;
    proyecto.cueEscuela = cueEscuela ?? proyecto.cueEscuela;
    proyecto.privada = privada ?? proyecto.privada;
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

    // Agrega el nombre del estado y lo devuelve en el json de la consulta
    const proyectoConNombreEstado = {
      ...proyecto.toObject(),
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
      nombreEscuela,
      cueEscuela,
      privada,
      emailEscuela,
      idResponsable,
      fechaInscripcion,
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
      ...(nombreEscuela && { nombreEscuela }),
      ...(cueEscuela && { cueEscuela }),
      ...(privada && { privada: privada === 'true' }),
      ...(emailEscuela && { emailEscuela }),
      ...(idResponsable && { idResponsable }),
      ...(fechaInscripcion && { fechaInscripcion }),
      ...(estado && { estado }),
      ...(videoPresentacion && { videoPresentacion }),
      ...(registroPedagogico && { registroPedagogico }),
      ...(carpetaCampo && { carpetaCampo }),
      ...(informeTrabajo && { informeTrabajo }),
      ...(sede && { sede }),
      ...(autorizacionImagen && { autorizacionImagen: autorizacionImagen === 'true' }),
    };
    const proyectos = await Proyecto.find(filtro);

    if (proyectos.length === 0)
      return res.status(204).json({ error: "No se han encontrado proyectos" });

    // Agrega el nombre del estado y lo devuelve en el json de la consulta
    const proyectosConNombreEstado = proyectos.map((proyecto) => ({
      ...proyecto.toObject(),
      nombreEstado: nombreEstado[proyecto.estado], // Obtenemos el nombre del estado según la clave
    }));



    return res.json({ proyectos: proyectosConNombreEstado  });
    
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
      nombreEscuela,
      cueEscuela,
      privada,
      emailEscuela,
      idResponsable,
      fechaInscripcion,
      estado,
      videoPresentacion,
      registroPedagogico,
      carpetaCampo,
      informeTrabajo,
      sede,
      autorizacionImagen,
    } = req.query;

    const responsable = await Docente.findOne({ usuario: uid });
    if(!responsable)  
      return res.status(401).json({ error: "No existe el docente correspondiente a su usuario" });

    // Crear un objeto de filtro con los parámetros de consulta presentes
    const filtro = {
      ...(titulo && { titulo }),
      ...(descripcion && { descripcion }),
      ...(nivel && { nivel }),
      ...(categoria && { categoria }),
      ...(nombreEscuela && { nombreEscuela }),
      ...(cueEscuela && { cueEscuela }),
      ...(privada && { privada: privada === 'true' }),
      ...(emailEscuela && { emailEscuela }),
      ...(idResponsable && { idResponsable }),
      ...(fechaInscripcion && { fechaInscripcion }),
      ...(estado && { estado }),
      ...(videoPresentacion && { videoPresentacion }),
      ...(registroPedagogico && { registroPedagogico }),
      ...(carpetaCampo && { carpetaCampo }),
      ...(informeTrabajo && { informeTrabajo }),
      ...(sede && { sede }),
      ...(autorizacionImagen && { autorizacionImagen: autorizacionImagen === 'true' }),
      idResponsable: responsable._id
    };

    const proyectos = await Proyecto.find(filtro);

    if (proyectos.length === 0)
      return res.status(204).json({ error: "No se han encontrado proyectos" });


    // Agrega el nombre del estado y lo devuelve en el json de la consulta
    const proyectosConNombreEstado = proyectos.map((proyecto) => ({
      ...proyecto.toObject(),
      nombreEstado: nombreEstado[proyecto.estado], // Obtenemos el nombre del estado según la clave
    }));

    return res.json({ proyectos: proyectosConNombreEstado  });
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
      nombreEscuela,
      cueEscuela,
      privada,
      emailEscuela,
      videoPresentacion,
      registroPedagogico,
      carpetaCampo,
      informeTrabajo,
      sede,
      autorizacionImagen,
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


    const existeSede = await Sede.findById(sede);
    if (!existeSede)
      return res.status(404).json({ error: "No existe la sede" });

    if (!autorizacionImagen)
      return res.status(404).json({
        error:
          "Para continuar, debe autorizar el uso y cesión de imagen de los estudiantes",
      });

    proyecto.titulo = titulo ?? proyecto.titulo;
    proyecto.descripcion = descripcion ?? proyecto.descripcion;
    proyecto.nivel = nivel ?? proyecto.nivel;
    proyecto.categoria = categoria ?? proyecto.categoria;
    proyecto.nombreEscuela = nombreEscuela ?? proyecto.nombreEscuela;
    proyecto.cueEscuela = cueEscuela ?? proyecto.cueEscuela;
    proyecto.privada = privada ?? proyecto.privada;
    proyecto.emailEscuela = emailEscuela ?? proyecto.emailEscuela;

    proyecto.videoPresentacion =
      videoPresentacion ?? proyecto.videoPresentacion;
    proyecto.registroPedagogico =
      registroPedagogico ?? proyecto.registroPedagogico;
    proyecto.carpetaCampo = carpetaCampo ?? proyecto.carpetaCampo;
    proyecto.informeTrabajo = informeTrabajo ?? proyecto.informeTrabajo;
    proyecto.sede = sede ?? proyecto.sede;
    proyecto.autorizacionImagen =
      autorizacionImagen ?? proyecto.autorizacionImagen;
    proyecto.grupoProyecto = grupoProyecto ?? proyecto.grupoProyecto;

    if(proyecto.estado === estado.instanciaEscolar)
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
  //obtengo el usuario logueado
  const uid = req.uid;
  console.log('paso')
  const usuario = await Usuario.findById(uid);

  //obtengo el id del proyecto
  const id_proyecto = req.params.id;
  //busco el proyecto que pertenece ese id
  const proyecto = await Proyecto.findById(id_proyecto);
  //asigno nombre a la nueva carpeta
  const name_folder = proyecto.titulo;

  try {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error al form-data", err.message);
        res.status(500).send("Error al procesar el form-data");
        return;
      }
      console.log(files);
      //creo la nueva carpeta
      const id_folder_new = await createFolder(name_folder, drive);

      //seteo el campo del proyecto "id_carpeta_drive" con el "id" de la carpeta creada
      proyecto.id_carpeta_drive = id_folder_new;

      console.log(id_folder_new);

      //comparto la carpeta creada con el email del usuario creador del proyecto y con cienciaConceta
      const email_user = usuario.email;
      const email_ciencia_conecta = "cienciaconecta.utn@gmail.com";
      await shareFolderWithPersonalAccount(
        id_folder_new,
        email_user,
        drive,
        "reader"
      );
      await shareFolderWithPersonalAccount(
        id_folder_new,
        email_ciencia_conecta,
        drive,
        "writer"
      );

      const files_registroPedagogicopdf = files.registroPedagogicopdf;
      const files_carpetaCampo = files.carpetaCampo;
      const files_informeTrabajo = files.informeTrabajo;

      const id_archivo_pdf = await sendFileToDrive(
        files_registroPedagogicopdf,
        id_folder_new,
        drive
      );
      console.log(id_archivo_pdf);
      proyecto.registroPedagogico = id_archivo_pdf;
      const id_archivo_pdf_campo = await sendFileToDrive(
        files_carpetaCampo,
        id_folder_new,
        drive
      );
      proyecto.carpetaCampo = id_archivo_pdf_campo;
      const id_archivo_informeTrabajo = await sendFileToDrive(
        files_informeTrabajo,
        id_folder_new,
        drive
      );
      proyecto.informeTrabajo = id_archivo_informeTrabajo;
      console.log(proyecto.informeTrabajo);
      if (id_archivo_pdf && id_archivo_pdf_campo && id_archivo_informeTrabajo) {
        res.status(200).json({
          id_inform_tranajp: proyecto.informeTrabajo,
          msg: "Archivos enviados correctamente a drive",
          proyecto,
        });
      } else {
        res.status(400).json({
          msg: "Error al subir los archivos a drive",
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      msg: "Error al enviar archivos a drive!!! ",
    });
  };
};

