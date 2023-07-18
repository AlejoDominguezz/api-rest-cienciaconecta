import { Proyecto, estado } from "../models/Proyecto.js";
import { Sede } from "../models/Sede.js";
import { Docente } from "../models/Docente.js";
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
    //existeProyecto(titulo);

    const uid = req.uid;
    const responsable = await Docente.findOne({ usuario: uid });
    if(!responsable)  
      return res.status(401).json({ error: "No existe el docente correspondiente a su usuario" });

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

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const consultarProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find();
    if (proyectos.length === 0)
      return res.status(204).json({ error: "No se han encontrado proyectos" });
    return res.json({ proyectos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error de servidor" });
  }
};

export const actualizarProyectoRegional = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      videoPresentacion,
      registroPedagogico,
      carpetaCampo,
      informeTrabajo,
      sede,
      autorizacionImagen,
      grupoProyecto,
    } = req.body;

    let proyecto = await Proyecto.findById(id);
    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });
    if (proyecto.estado === estado.inactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ha sido dado de baja" });
    if (proyecto.estado === estado.instanciaRegional)
      return res
        .status(404)
        .json({
          error:
            "El proyecto ya ha sido actualizado a etapa regional. Aún puede modificar los datos de proyecto",
        });

    let existeSede = await Sede.findById(sede);
    if (!existeSede)
      return res.status(404).json({ error: "No existe la sede" });

    if (!autorizacionImagen)
      return res
        .status(404)
        .json({
          error:
            "Para continuar, debe autorizar el uso y cesión de imagen de los estudiantes",
        });

    proyecto.videoPresentacion = videoPresentacion ?? proyecto.videoPresentacion;
    proyecto.registroPedagogico = registroPedagogico ?? proyecto.registroPedagogico;
    proyecto.carpetaCampo = carpetaCampo ?? proyecto.carpetaCampo;
    proyecto.informeTrabajo = informeTrabajo ?? proyecto.informeTrabajo;
    proyecto.sede = sede ?? proyecto.sede;
    proyecto.autorizacionImagen = autorizacionImagen ?? proyecto.autorizacionImagen;
    proyecto.grupoProyecto = grupoProyecto ?? proyecto.grupoProyecto;

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

    let proyecto = await Proyecto.findById(id);

    if (!proyecto)
      return res.status(404).json({ error: "No existe el proyecto" });
    if (proyecto.estado === estado.inactivo)
      return res
        .status(404)
        .json({ error: "El proyecto ha sido dado de baja" });

    let existeSede = await Sede.findById(sede);
    if (!existeSede)
      return res.status(404).json({ error: "No existe la sede" });

    if (!autorizacionImagen)
      return res
        .status(404)
        .json({
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

    await proyecto.save();

    return res.json({ proyecto });
  } catch (error) {
    console.log(error);
    if (error.kind === "ObjectId")
      return res.status(403).json({ error: "Formato ID incorrecto" });
    res.status(500).json({ error: "Error de servidor" });
  }
};
