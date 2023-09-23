import { Proyecto, estado, nombreEstado } from "../models/Proyecto.js";
import { Sede } from "../models/Sede.js";
import { Docente } from "../models/Docente.js";
import { Usuario } from "../models/Usuario.js";
import { drive } from "../services/drive/drive.js";
import {
  createFolder,
  shareFolderWithPersonalAccount,
  sendFileToDrive,
  deleteFile,
  getIdByUrl,
} from "../services/drive/helpers-drive.js";
import formidable from "formidable";
import { existeProyecto } from "../helpers/db-validar.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";
import { Feria, estadoFeria } from "../models/Feria.js";
import { roles } from "../helpers/roles.js";
import multer from "multer";

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
    const responsable = await Docente.findOne({ usuario: uid });
    const usuario = await Usuario.findById(uid);
    if (!responsable)
      return res
        .status(401)
        .json({ error: "No existe el docente correspondiente a su usuario" });

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
      // videoPresentacion,
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

    // proyecto.videoPresentacion =
    //   videoPresentacion ?? proyecto.videoPresentacion;
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

      //creo la nueva carpeta
      const id_folder_new = await createFolder(name_folder, drive);

      //seteo el campo del proyecto "id_carpeta_drive" con el "id" de la carpeta creada
      proyecto.id_carpeta_drive = id_folder_new;

      // Compartir la carpeta creada en paralelo
      const email_ciencia_conecta = "cienciaconecta.utn@gmail.com";
      await Promise.all([
        shareFolderWithPersonalAccount(
          id_folder_new,
          email_ciencia_conecta,
          drive,
          "writer"
        ),
      ]);

      const uploadPromises = [];

      // Subir los archivos en paralelo
      uploadPromises.push(
        sendFileToDrive(files.registroPedagogicopdf, id_folder_new, drive)
      );
      uploadPromises.push(
        sendFileToDrive(files.carpetaCampo, id_folder_new, drive)
      );
      uploadPromises.push(
        sendFileToDrive(files.informeTrabajo, id_folder_new, drive)
      );
      uploadPromises.push(
        sendFileToDrive(files.autorizacionImagen, id_folder_new, drive)
      );

      const [
        id_archivo_pdf,
        id_archivo_pdf_campo,
        id_archivo_informeTrabajo,
        id_archivo_autorizacionImagen,
      ] = await Promise.all(uploadPromises);

      proyecto.registroPedagogico = `https://drive.google.com/file/d/${id_archivo_pdf}/preview`;
      proyecto.carpetaCampo = `https://drive.google.com/file/d/${id_archivo_pdf_campo}/preview`;
      proyecto.informeTrabajo = `https://drive.google.com/file/d/${id_archivo_informeTrabajo}/preview`;
      proyecto.autorizacionImagen = `https://drive.google.com/file/d/${id_archivo_autorizacionImagen}/preview`;

      if (
        id_archivo_pdf &&
        id_archivo_pdf_campo &&
        id_archivo_informeTrabajo &&
        id_archivo_autorizacionImagen
      ) {
        proyecto.save();
        return res.status(200).json({
          id_inform_tranajp: proyecto.informeTrabajo,
          msg: "Archivos enviados correctamente a drive",
          proyecto,
        });
      } else {
        return res.status(400).json({
          msg: "Error al subir los archivos a drive",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      msg: "Error al enviar archivos a drive!!! ",
    });
  }
};

export const actualizarArchivosRegional = async (req, res) => {
  try {
    const id = req.params.id;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto.id_carpeta_drive) {
      return res.status(400).json({
        msg: `El proyecto ${proyecto.titulo} no tiene carpeta de drive asociada`,
      });
    }

    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error al form-data", err.message);
        res.status(500).send("Error al procesar el form-data");
        return;
      }
      if (!files || Object.keys(files).length === 0) {
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


      
      const id_folder = proyecto.id_carpeta_drive;
      let id_archivo_pdf = null;
      let id_carpeta_campo = null;
      let id_informe_trabajo = null;
      let id_autorizacion_imagen = null;

      if (files.registroPedagogicopdf) {
        if (proyecto.registroPedagogico) {
          const id_registro = await getIdByUrl(proyecto.registroPedagogico);
          if (id_registro) {
            const delete_file = await deleteFile(id_registro, drive);
            if (delete_file) {
              id_archivo_pdf = await sendFileToDrive(
                files.registroPedagogicopdf,
                id_folder,
                drive
              );
            }
          }
        } else {
          console.log("camino else");
          id_archivo_pdf = await sendFileToDrive(
            files.registroPedagogicopdf,
            id_folder,
            drive
          );
        }
        if (id_archivo_pdf) {
          console.log(id_archivo_pdf);
          proyecto.registroPedagogico = `https://drive.google.com/file/d/${id_archivo_pdf}/preview`;
        }
      }
      //si existe carpetaCampo...
      if (files.carpetaCampo) {
        if (proyecto.carpetaCampo) {
          const id_campo = await getIdByUrl(proyecto.carpetaCampo);
          if (id_campo) {
            const delete_campo = await deleteFile(id_campo, drive);
            if (delete_campo) {
              id_carpeta_campo = await sendFileToDrive(
                files.carpetaCampo,
                id_folder,
                drive
              );
            }
          }
        } else {
          console.log("camino else");
          id_carpeta_campo = await sendFileToDrive(
            files.carpetaCampo,
            id_folder,
            drive
          );
        }
        if (id_carpeta_campo) {
          console.log(id_carpeta_campo);
          proyecto.carpetaCampo = `https://drive.google.com/file/d/${id_carpeta_campo}/preview`;
        }
      }

      //si existe informeTrabajo...
      if (files.informeTrabajo) {
        if (proyecto.informeTrabajo) {
          const id_informe = await getIdByUrl(proyecto.informeTrabajo);
          if (id_informe) {
            const delete_informe = await deleteFile(id_informe, drive);
            if (delete_informe) {
              id_informe_trabajo = await sendFileToDrive(
                files.informeTrabajo,
                id_folder,
                drive
              );
            }
          }
        } else {
          id_informe_trabajo = await sendFileToDrive(
            files.informeTrabajo,
            id_folder,
            drive
          );
        }
        if (id_informe_trabajo) {
          proyecto.informeTrabajo = `https://drive.google.com/file/d/${id_informe_trabajo}/preview`;
        }
      }

      //si existe autorizacionImagen
      if (files.autorizacionImagen) {
        if (proyecto.autorizacionImagen) {
          const id_informe_ = await getIdByUrl(proyecto.autorizacionImagen);
          if (id_informe_) {
            const delete_informe_ = await deleteFile(id_informe_, drive);
            if (delete_informe_) {
              id_autorizacion_imagen = await sendFileToDrive(
                files.autorizacionImagen,
                id_folder,
                drive
              );
            }
          }
        } else {
          id_autorizacion_imagen = await sendFileToDrive(
            files.autorizacionImagen,
            id_folder,
            drive
          );
        }
        if (id_autorizacion_imagen) {
          proyecto.autorizacionImagen = `https://drive.google.com/file/d/${id_autorizacion_imagen}/preview`;
        }
      }

      if (id_archivo_pdf || id_carpeta_campo || id_autorizacion_imagen || id_informe_trabajo) {
        await proyecto.save();
        return res.status(200).json({
          msg: "Archivos actualizados correctamente",
          proyecto,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error del servidor",
    });
  }
};

export const downloadDocuments = async(req , res) => {
  try {
    const id = req.params.id;
    console.log(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "ERROR AL OBTENER LOS DOCUMENTOS DEL PROYECTO."})
  }
}