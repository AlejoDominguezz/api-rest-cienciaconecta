import { Evaluacion, estadoEvaluacion, nombreEstadoEvaluacion } from "../models/Evaluacion.js";
import { EvaluacionExposicion, estadoEvaluacionExposicion, nombreEstadoExposicion } from "../models/EvaluacionExposicion.js";
import { EvaluacionExposicionProvincial, estadoEvaluacionExposicionProvincial, nombreEstadoExposicionProvincial } from "../models/EvaluacionExposicion_Provincial.js";
import { Promocion, promocionA } from "../models/Promocion.js"
import { Proyecto, nombreEstado } from "../models/Proyecto.js";
import { getFeriaActivaFuncion } from "./ferias.controller.js"


// Función para obtener todos los proyectos regionales que están en condiciones de ser promovidos a instancia provincial --------------------------------------
export const obtenerProyectosProvincial = async (req, res) => {
  const id_nivel = req.body.nivel;
  const id_sede = req.body.sede;
  const feriaActiva = await getFeriaActivaFuncion();
  const promocionExistente = await Promocion.findOne({ nivel: id_nivel, sede: id_sede, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial });
  const cuposNivel = feriaActiva.instancias.instanciaRegional.cupos.porNivel.find(cupo => (cupo.nivel?.toString() === id_nivel.toString()));
  const cuposSede = feriaActiva.instancias.instanciaRegional.cupos.porSede.find(cupo => (cupo.sede?.toString() === id_sede.toString()));
  const cantidadCuposNivel = cuposNivel ? cuposNivel.cantidad : 0;
  const cantidadCuposSede = cuposSede ? cuposSede.cantidad : 0;

  const promocionesNivel = await Promocion.find({ nivel: id_nivel, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial })
    let promovidosNivel = 0;
    for (const promocionNivel of promocionesNivel){
      promovidosNivel += promocionNivel.proyectos.length;
    }

  const promocionesSede = await Promocion.find({ sede: id_sede, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial })
  let promovidosSede = 0;
  for (const promocionSede of promocionesSede){
    promovidosSede += promocionSede.proyectos.length;
  }


  let proyectos = await Proyecto.find({ nivel: id_nivel, sede: id_sede, feria: feriaActiva._id })
      .select('-__v -QR -id_carpeta_drive')
      .lean()
      .exec();

  if (proyectos.length == 0) {
      return res.status(204).json({ error: "No existen proyectos que cumplan las condiciones para ser promovidos" });
  }

  if (promocionExistente) {
      proyectos = proyectos.map((proyecto) => {
          if (promocionExistente.proyectos.includes(proyecto._id)) {
              return {
                  ...proyecto,
                  promovido: true
              };
          } else {
              return {
                  ...proyecto,
                  promovido: false
              };
          }
      });
  } else {
      proyectos = proyectos.map((proyecto) => ({
          ...proyecto,
          promovido: false
      }));
  }

  const proyectosInfoEvaluacion = await agregarInformacionEvaluacion(proyectos);

  const proyectosFiltrados = proyectosInfoEvaluacion.filter((proyecto) =>
      (proyecto.exposicion?.estado == estadoEvaluacionExposicion.cerrada) &&
      (proyecto.evaluacion?.estado == estadoEvaluacion.cerrada));

  if (proyectosFiltrados.length == 0) {
      return res.status(204).json({ error: "No existen proyectos que cumplan las condiciones para ser promovidos" });
  }

  const proyectosSorted = proyectosFiltrados.sort((a, b) => b.exposicion.puntajeFinal - a.exposicion.puntajeFinal);

  return res.json({ proyectos: proyectosSorted, cuposNivel: cantidadCuposNivel, cuposSede: cantidadCuposSede, promovidosNivel, promovidosSede });
};


// Función para obtener todos los proyectos provinciales que están en condiciones de ser promovidos a instancia nacionales --------------------------------------
export const obtenerProyectosNacional = async (req, res) => {
  const id_nivel = req.body.nivel;
  const feriaActiva = await getFeriaActivaFuncion();
  const promocionExistente = await Promocion.findOne({ nivel: id_nivel, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaNacional });
  const cuposNivel = feriaActiva.instancias.instanciaProvincial.cupos.find(cupo => cupo.nivel?.toString() === id_nivel.toString());
  const cantidadCupos = cuposNivel ? cuposNivel.cantidad : 0;
  let promovidosNivel = 0;
  if (promocionExistente) {
    promovidosNivel = promocionExistente.proyectos.length;
  }


  let proyectos = await Proyecto.find({nivel: id_nivel, feria: feriaActiva._id})
  .select('-__v -QR -id_carpeta_drive')
          .lean()
          .exec();

  if(proyectos.length == 0){
      return res.status(204).json({ error: "No existen proyectos que cumplan las condiciones para ser promovidos" });
  }

  if (promocionExistente) {
    proyectos = proyectos.map((proyecto) => {
        if (promocionExistente.proyectos.includes(proyecto._id)) {
            return {
                ...proyecto,
                promovido: true
            };
        } else {
            return {
                ...proyecto,
                promovido: false
            };
        }
    });
  } else {
      proyectos = proyectos.map((proyecto) => ({
          ...proyecto,
          promovido: false
      }));
  }
  
  const proyectosInfoEvaluacion = await agregarInformacionEvaluacion_Provincial(proyectos)

  const proyectosFiltrados = proyectosInfoEvaluacion.filter((proyecto) => 
      (proyecto.exposicion?.estado == estadoEvaluacionExposicionProvincial.cerrada))
  
  if (proyectosFiltrados.length == 0) {
      return res.status(204).json({ error: "No existen proyectos que cumplan las condiciones para ser promovidos" });
  }

  const proyectosSorted = proyectosFiltrados.sort((a, b) => b.exposicion.puntajeExposicion - a.exposicion.puntajeExposicion);
  
  return res.json({proyectos: proyectosSorted, cuposNivel: cantidadCupos, promovidosNivel});
}


// Función para agregar información sobre la Evaluación Teórica y de Exposición Regional a un proyecto -----------------------------------------------------
const agregarInformacionEvaluacion = async (proyectos) => {
  const proyectosInfoEvaluacion = await Promise.all(
      proyectos.map(async (proyecto) => {
        
          const evaluacion_teorica = await Evaluacion.findOne({proyectoId: proyecto._id})
          .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
          .lean()
          .exec();


          const evaluacion_exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
          .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
          .lean()
          .exec();

          if(!evaluacion_teorica){

            return {
              ...proyecto,
              nombreEstado: nombreEstado[proyecto.estado],
            }

          } else if(!evaluacion_exposicion) {

            evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
            return {
              ...proyecto,
              nombreEstado: nombreEstado[proyecto.estado],
              evaluacion: evaluacion_teorica,
            };

          } 

          evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
          evaluacion_exposicion.nombreEstado = nombreEstadoExposicion[evaluacion_exposicion.estado];
          return {
            ...proyecto,
            nombreEstado: nombreEstado[proyecto.estado],
            evaluacion: evaluacion_teorica,
            exposicion: evaluacion_exposicion,
          };
  
      })
  )

  return proyectosInfoEvaluacion
}



// Función para agregar información sobre la Evaluación Teórica y de Exposición Provincial a un proyecto -----------------------------------------------------
const agregarInformacionEvaluacion_Provincial = async (proyectos) => {
const proyectosInfoEvaluacion = await Promise.all(
    proyectos.map(async (proyecto) => {

        const evaluacion_exposicion = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto._id})
        .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
        .lean()
        .exec();

        if(!evaluacion_exposicion){

            return {
              ...proyecto,
              nombreEstado: nombreEstado[proyecto.estado],
            }

        } else {

          evaluacion_exposicion.nombreEstado = nombreEstadoExposicionProvincial[evaluacion_exposicion.estado];
          return {
            ...proyecto,
            nombreEstado: nombreEstado[proyecto.estado],
            exposicion: evaluacion_exposicion,
          };

        } 

    })
)

return proyectosInfoEvaluacion
}




// Función para agregar información sobre la Evaluación Teórica y de Exposición Regional a un proyecto -----------------------------------------------------
export const agregarInformacionEvaluacionProyecto = async (proyecto) => {
  
  const evaluacion_teorica = await Evaluacion.findOne({proyectoId: proyecto._id})
  .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
  .lean()
  .exec();

  const evaluacion_exposicion = await EvaluacionExposicion.findOne({proyectoId: proyecto._id})
  .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
  .lean()
  .exec();

  if(!evaluacion_teorica ){

    return {
      ...proyecto,
      nombreEstado: nombreEstado[proyecto.estado],
    }

  } else if(!evaluacion_exposicion) {

    evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
    return {
      ...proyecto,
      nombreEstado: nombreEstado[proyecto.estado],
      evaluacion: evaluacion_teorica,
    };

  } 

  evaluacion_teorica.nombreEstado = nombreEstadoEvaluacion[evaluacion_teorica.estado];
  evaluacion_exposicion.nombreEstado = nombreEstadoExposicion[evaluacion_exposicion.estado];
  return {
    ...proyecto,
    nombreEstado: nombreEstado[proyecto.estado],
    evaluacion: evaluacion_teorica,
    exposicion: evaluacion_exposicion,
  };

}


// Función para agregar información sobre la Evaluación Teórica y de Exposición Provincial a un proyecto -----------------------------------------------------
export const agregarInformacionEvaluacionProyecto_Provincial = async (proyecto) => {

  const evaluacion_exposicion = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto._id})
  .select('-__v -proyectoId -evaluacion -comentarios -tokenSesion')
  .lean()
  .exec();

  if(!evaluacion_exposicion){

      return {
        ...proyecto,
        nombreEstado: nombreEstado[proyecto.estado],
      }

  } else {

    evaluacion_exposicion.nombreEstado = nombreEstadoExposicionProvincial[evaluacion_exposicion.estado];
    return {
      ...proyecto,
      nombreEstado: nombreEstado[proyecto.estado],
      exposicion: evaluacion_exposicion,
    };

  } 

}


// Funcion para promover proyectos a la instancia Nacional ---------------------------------------------------------------------------------------------------
export const promoverProyectos_Nacional = async (req, res) => {
  try {
      const id_proyectos = req.body.proyectos
      const id_nivel = req.body.nivel;
      const feriaActiva = await getFeriaActivaFuncion()
      const cuposNivel = feriaActiva.instancias.instanciaProvincial.cupos.find(cupo => cupo.nivel?.toString() === id_nivel.toString());
      const cantidadCupos = cuposNivel ? cuposNivel.cantidad : 0;

      if(id_proyectos.length > cantidadCupos) {
          return res.status(401).json({ error: `No es posible promover ${id_proyectos.length} proyectos. El límite de cupos en esta instancia para el nivel ingresado es ${cantidadCupos}` });
      }

      let promocion = await Promocion.findOne({nivel: id_nivel, sede: null, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaNacional})
      
      if(promocion) {
          promocion.proyectos = id_proyectos
      } else {
          promocion = new Promocion({
              proyectos: id_proyectos,
              feria: feriaActiva._id,
              promocionAInstancia: promocionA.instanciaNacional,
              nivel: id_nivel,
              sede: null,
          })
      }

      promocion.save()
      return res.json({msg: "Todos los proyectos han sido agregado a la lista de proyectos por promover al final de la instancia"});

  } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Error de servidor" });
  }
}




// Funcion para promover proyectos a la instancia Provincial ---------------------------------------------------------------------------------------------------
export const promoverProyectos_Provincial = async (req, res) => {
try {
    const id_proyectos = req.body.proyectos
    const id_nivel = req.body.nivel;
    const id_sede = req.body.sede;
    const feriaActiva = await getFeriaActivaFuncion()
    const cuposNivel = feriaActiva.instancias.instanciaRegional.cupos.porNivel.find(cupo => (cupo.nivel?.toString() === id_nivel.toString()));
    const cuposSede = feriaActiva.instancias.instanciaRegional.cupos.porSede.find(cupo => (cupo.sede?.toString() === id_sede.toString()));
    const cantidadCuposNivel = cuposNivel ? cuposNivel.cantidad : 0;
    const cantidadCuposSede = cuposSede ? cuposSede.cantidad : 0;

    // Validar cupos por nivel
    const promocionesNivel = await Promocion.find({ nivel: id_nivel, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial })
    let totalProyectosNivel = 0;
    for (const promocionNivel of promocionesNivel){
      totalProyectosNivel += promocionNivel.proyectos.length;
    }

    //console.log(`Cantidad proyectos promovidos nivel: ${id_proyectos.length + totalProyectosNivel}. Límite: ${cantidadCuposNivel}`)
    
    if((id_proyectos.length + totalProyectosNivel) > cantidadCuposNivel) {
        return res.status(401).json({ error: `No es posible promover ${id_proyectos.length} proyecto/s, teniendo ${totalProyectosNivel} ya promovido/s. El límite de cupos en esta instancia para el nivel ingresado es de ${cantidadCuposNivel}` });
    }

    // Validar cupos por sede
    const promocionesSede = await Promocion.find({ sede: id_sede, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial })
    let totalProyectosSede = 0;
    for (const promocionSede of promocionesSede){
      totalProyectosSede += promocionSede.proyectos.length;
    }

    //console.log(`Cantidad proyectos promovidos sede: ${id_proyectos.length + totalProyectosSede}. Límite: ${cantidadCuposSede}`)
    
    if((id_proyectos.length + totalProyectosSede) > cantidadCuposSede) {
        return res.status(401).json({ error: `No es posible promover ${id_proyectos.length} proyecto/s, teniendo ${totalProyectosSede} ya promovido/s. El límite de cupos en esta instancia para la sede ingresada es de ${cantidadCuposSede}` });
    }


    // Crear o modificar el documento Promocion, para la sede y el nivel del proyectoF
    let promocion = await Promocion.findOne({nivel: id_nivel, sede: id_sede, feria: feriaActiva._id, promocionAInstancia: promocionA.instanciaProvincial})
    
    if(promocion) {
        promocion.proyectos = id_proyectos
    } else {
        promocion = new Promocion({
            proyectos: id_proyectos,
            feria: feriaActiva._id,
            promocionAInstancia: promocionA.instanciaProvincial,
            nivel: id_nivel,
            sede: id_sede,
        })
    }

    promocion.save()

    return res.json({msg: "Todos los proyectos han sido agregado a la lista de proyectos por promover al final de la instancia"});

} catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Error de servidor" });
}
}


