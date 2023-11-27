import { formatearSalida_porcProyectosInscriptos, porcProyectos } from "../services/reportes/porcProyectosInscriptos.js";
import { contarCantidadProyectos, formatearSalida_cantidadProyectosInscriptos } from "../services/reportes/cantidadProyectosInscriptos_services.js";
import { formatearSalida_puntajePromedio, obtenerPromedioConColor } from "../services/reportes/puntajePromedio_services.js";
import { buscarPor, obtenerTodasClases } from "../services/reportes/reportes_services.js";
import { Feria } from "../models/Feria.js";
import { Proyecto } from "../models/Proyecto.js";
import { formatearSalida_cantProyectosFeria } from "../services/reportes/cantidadProyectosFeria_services.js";
import { Evaluador } from "../models/Evaluador.js";
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";
import { formatearSalida_cantEvaluadores } from "../services/reportes/cantidadEvaluadores_services.js";
import { capitalizarPalabras } from "../helpers/capitalizarPalabras.js";
import { ObtenerCantProyectosAprobados, formatearSalida_proyectosAprobados } from "../services/reportes/cantidadProyectosAprobados_services.js";
import { ObtenerPorcProyectosAprobados, formatearSalida_porcProyectosAprobados } from "../services/reportes/porcProyectosAprobados_services.js";


export const puntajePromedio = async (req, res) => {
    try {
        
        const {
            filtro,
            feria,
          } = req.query;

          // Filtro por feria, o para todas las ferias
          let filter = null;
          if (feria) {
            filter = {feria: feria, estado: { $gte: "3", $ne: "9" }}
          } else {
            filter = {estado: { $gte: "3", $ne: "9" }}
          }
        
          let promedios = 0;
          let puntajePromedio = [];

          // Filtro por categoría, nivel, o departamento
          if (filtro == "categoria"){

            const proyectosPorCategoria = await buscarPor("categoria" , filter);
            promedios = await obtenerPromedioConColor("categoria", proyectosPorCategoria);
            puntajePromedio = await formatearSalida_puntajePromedio("categoria", promedios)

          } else if (filtro == "nivel"){
            
            const proyectosPorNivel = await buscarPor("nivel", filter);
            promedios = await obtenerPromedioConColor("nivel", proyectosPorNivel);
            puntajePromedio = await formatearSalida_puntajePromedio("nivel", promedios)


          } else if (filtro == "departamento"){
            const proyectosPorDepto = await buscarPor("departamento", filter);
            promedios = await obtenerPromedioConColor("departamento", proyectosPorDepto);
            puntajePromedio = await formatearSalida_puntajePromedio("departamento", promedios)
          }

          return res.json({data: puntajePromedio});

    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
}




export const cantidadProyectosInscriptos = async (req, res) => {
  try {

    const {
      filtro,
      feria,
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = null;
    if (feria) {
      filter = {feria: feria, estado: { $ne: "9" }}
    } else {
      filter = {estado: { $ne: "9" }}
    }
    
    let proyectosInscriptos = 0;
    let cantidadProyectos = {}
    let cantidadProyectosFormateado = {}

    // Filtro por categoría, nivel, o departamento
    if (filtro == "categoria"){
      proyectosInscriptos = await buscarPor("categoria" , filter);
      cantidadProyectos = await contarCantidadProyectos("categoria", proyectosInscriptos)
      cantidadProyectosFormateado = await formatearSalida_cantidadProyectosInscriptos("categoria", cantidadProyectos)

    } else if (filtro == "nivel"){
      proyectosInscriptos = await buscarPor("nivel", filter);
      cantidadProyectos = await contarCantidadProyectos("nivel", proyectosInscriptos)
      cantidadProyectosFormateado = await formatearSalida_cantidadProyectosInscriptos("nivel", cantidadProyectos)

    } else if (filtro == "departamento"){
      proyectosInscriptos = await buscarPor("departamento", filter);
      cantidadProyectos = await contarCantidadProyectos("departamento", proyectosInscriptos)
      cantidadProyectosFormateado = await formatearSalida_cantidadProyectosInscriptos("departamento", cantidadProyectos)
    
    }

    return res.json({data: cantidadProyectosFormateado});

  } catch (error) {
    //console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}




export const porcProyectosInscriptos = async (req, res) => {
  try {

    const {
      filtro,
      feria,
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = null;
    if (feria) {
      filter = {feria: feria, estado: { $ne: "9" }}
    } else {
      filter = {estado: { $ne: "9" }}
    }
    
    let proyectosInscriptos = 0;
    let cantidadProyectos = {}
    let porcentProyectos = {}
    let porcProyectosFormateado = {}

    // Filtro por categoría, nivel, o departamento
    if (filtro == "categoria"){
      proyectosInscriptos = await buscarPor("categoria" , filter);
      cantidadProyectos = await contarCantidadProyectos("categoria", proyectosInscriptos)
      porcentProyectos = await porcProyectos(cantidadProyectos);
      porcProyectosFormateado = await formatearSalida_porcProyectosInscriptos("categoria", porcentProyectos)

    } else if (filtro == "nivel"){
      proyectosInscriptos = await buscarPor("nivel", filter);
      cantidadProyectos = await contarCantidadProyectos("nivel", proyectosInscriptos)
      porcentProyectos = await porcProyectos(cantidadProyectos);
      porcProyectosFormateado = await formatearSalida_porcProyectosInscriptos("nivel", porcentProyectos)

    } else if (filtro == "departamento"){
      proyectosInscriptos = await buscarPor("departamento", filter);
      cantidadProyectos = await contarCantidadProyectos("departamento", proyectosInscriptos)
      porcentProyectos = await porcProyectos(cantidadProyectos);
      porcProyectosFormateado = await formatearSalida_porcProyectosInscriptos("departamento", porcentProyectos)
    
    }

    return res.json({data: porcProyectosFormateado});

  } catch (error) {
    //console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}




export const cantidadProyectosFeria = async (req, res) => {
  try {

    // Obtener todas las ferias
    const ferias = await Feria.find();

    let proyectosXferia = [];
    for (const feria of ferias){
      const proyectos = await Proyecto.find({feria: feria._id, estado: { $ne: "9" }})
      const resultado = {
        feria: feria.nombre,
        proyectos: proyectos.length
      }
      proyectosXferia.push(resultado)
    }
    
    const cantProyectosFeria = await formatearSalida_cantProyectosFeria(proyectosXferia)

    return res.json({data: cantProyectosFeria});

  } catch (error) {
    //console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}




export const cantidadEvaluadores = async (req, res) => {
  try {
    
    const {
      feria,
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = {};
    if (feria) {
      filter = {_id: feria}
    }

    const ferias = await Feria.find(filter);


    let resultados = [];
    const departamentos = await obtenerTodasClases("departamento");

    for (const depto of departamentos) {
      // Objeto para almacenar el resultado para cada departamento
      let resultadoDepto = {
        departamento: capitalizarPalabras(depto),
        evaluadores: 0,
      };

      // Iteramos sobre cada feria
      for (const feria of ferias) {
        // Obtenemos las sedes regionales de la feria
        const sedesRegionales = feria.instancias.instanciaRegional.sedes;

        // Obtener las sedes de cada departamento
        const sedesRegionalesDeDepto = await EstablecimientoEducativo.find({
          _id: { $in: [...sedesRegionales] },
          departamento: depto,
        }).select('_id');

        // Obtener la cantidad de evaluadores para la feria y el departamento
        const evaluadores = await Evaluador.countDocuments({
          feria: feria._id,
          pendiente: false,
          sede: { $in: sedesRegionalesDeDepto.map(sede => sede._id) },
        });

        // Sumar al resultado para el departamento
        resultadoDepto.evaluadores += evaluadores;
      }

      // Agregar el resultado del departamento al array final
      resultados.push(resultadoDepto);
    }

    const cantEvaluadores = await formatearSalida_cantEvaluadores(resultados)
    return res.status(200).json(cantEvaluadores);

  } catch (error) {
    //console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }  
}




export const cantidadProyectosAprobados = async (req, res) => {
  try {
    
    const {
      filtro,
      feria,
      puntaje
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = null;
    if (feria) {
      filter = {feria: feria, estado: { $gte: "3", $ne: "9" }}
    } else {
      filter = {estado: { $gte: "3", $ne: "9" }}
    }

    let cantAprobados = [];
    let cantAprobadosFormateado = [];

    // Filtro por categoría, nivel, o departamento
    if (filtro == "categoria"){

      const proyectosPorCategoria = await buscarPor("categoria" , filter);
      cantAprobados = await ObtenerCantProyectosAprobados("categoria", proyectosPorCategoria, puntaje, true);
      cantAprobadosFormateado = await formatearSalida_proyectosAprobados("categoria", cantAprobados, "Aprobados")

    } else if (filtro == "nivel"){
      
      const proyectosPorNivel = await buscarPor("nivel", filter);
      cantAprobados = await ObtenerCantProyectosAprobados("nivel", proyectosPorNivel, puntaje, true);
      cantAprobadosFormateado = await formatearSalida_proyectosAprobados("nivel", cantAprobados, "Aprobados")


    } else if (filtro == "departamento"){
      const proyectosPorDepto = await buscarPor("departamento", filter);
      cantAprobados = await ObtenerCantProyectosAprobados("departamento", proyectosPorDepto, puntaje, true);
      cantAprobadosFormateado = await formatearSalida_proyectosAprobados("departamento", cantAprobados, "Aprobados")
    }

    return res.json({data: cantAprobadosFormateado});


  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}




export const cantidadProyectosDesaprobados = async (req, res) => {
  try {
    
    const {
      filtro,
      feria,
      puntaje
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = null;
    if (feria) {
      filter = {feria: feria, estado: { $gte: "3", $ne: "9" }}
    } else {
      filter = {estado: { $gte: "3", $ne: "9" }}
    }

    let cantDesaprobados = [];
    let cantDesaprobadosFormateado = [];

    // Filtro por categoría, nivel, o departamento
    if (filtro == "categoria"){

      const proyectosPorCategoria = await buscarPor("categoria" , filter);
      cantDesaprobados = await ObtenerCantProyectosAprobados("categoria", proyectosPorCategoria, puntaje, false);
      cantDesaprobadosFormateado = await formatearSalida_proyectosAprobados("categoria", cantDesaprobados, "Desaprobados")

    } else if (filtro == "nivel"){
      
      const proyectosPorNivel = await buscarPor("nivel", filter);
      cantDesaprobados = await ObtenerCantProyectosAprobados("nivel", proyectosPorNivel, puntaje, false);
      cantDesaprobadosFormateado = await formatearSalida_proyectosAprobados("nivel", cantDesaprobados, "Desaprobados")


    } else if (filtro == "departamento"){
      const proyectosPorDepto = await buscarPor("departamento", filter);
      cantDesaprobados = await ObtenerCantProyectosAprobados("departamento", proyectosPorDepto, puntaje, false);
      cantDesaprobadosFormateado = await formatearSalida_proyectosAprobados("departamento", cantDesaprobados, "Desaprobados")
    }

    return res.json({data: cantDesaprobadosFormateado});


  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}



export const porcProyectosAprobados = async (req, res) => {
  try {
    
    const {
      filtro,
      feria,
      puntaje
    } = req.query;

    // Filtro por feria, o para todas las ferias
    let filter = null;
    if (feria) {
      filter = {feria: feria, estado: { $gte: "3", $ne: "9" }}
    } else {
      filter = {estado: { $gte: "3", $ne: "9" }}
    }

    let porcAprobados = [];
    let porcAprobadosFormateado = [];

    // Filtro por categoría, nivel, o departamento
    if (filtro == "categoria"){

      const proyectosPorCategoria = await buscarPor("categoria" , filter);
      porcAprobados = await ObtenerPorcProyectosAprobados("categoria", proyectosPorCategoria, puntaje);
      porcAprobadosFormateado = await formatearSalida_porcProyectosAprobados("categoria", porcAprobados)

    } else if (filtro == "nivel"){
      
      const proyectosPorNivel = await buscarPor("nivel", filter);
      porcAprobados = await ObtenerPorcProyectosAprobados("nivel", proyectosPorNivel, puntaje);
      porcAprobadosFormateado = await formatearSalida_porcProyectosAprobados("nivel", porcAprobados)


    } else if (filtro == "departamento"){
      const proyectosPorDepto = await buscarPor("departamento", filter);
      porcAprobados = await ObtenerPorcProyectosAprobados("departamento", proyectosPorDepto, puntaje);
      porcAprobadosFormateado = await formatearSalida_porcProyectosAprobados("departamento", porcAprobados)
    }

    return res.json({data: porcAprobadosFormateado});


  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
  }
}