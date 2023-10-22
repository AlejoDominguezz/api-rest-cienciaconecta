import { arraysComentariosIguales, arraysEvaluacionIguales } from "../helpers/arrayComparation.js";
import { EvaluacionExposicionProvincial, estadoEvaluacionExposicionProvincial } from "../models/EvaluacionExposicion_Provincial.js";
import { estado } from "../models/Proyecto.js";
import { obtenerPuntaje } from "./evaluaciones.controller.js";

// Obtener estructura de evaluacion de exposicion para iniciar la evaluación, exista o no una evaluacion previa -------------------------------
export const iniciarEvaluacionExposicion = async (req, res) => {
    const feria = req.feria;
    const proyecto = req.proyecto;
    const evaluador = req.evaluador;

    const evaluacion = await EvaluacionExposicionProvincial.findOne({ proyectoId: proyecto.id });
  
    // Obtengo la estructura de rubricas de la feria
    const evaluacion_estructura = feria.criteriosEvaluacion;
  
    // SI NO EXISTE UNA EVALUACIÓN PREVIA, SE CREA, DEVOLVIENDO LA ESTRUCTURA SIN OPCIONES SELECCIONADAS NI COMENTARIOS
    // TAMBIÉN PASA POR ESTA RAMA SI EXISTE EVALUACIÓN PREVIA, Y LA EVALUACIÓN ESTÁ VACÍA
    if (!evaluacion || (evaluacion.evaluando?.toString() == evaluador._id.toString() && evaluacion.evaluacion == null)) {
  
      // Sólo si no existe evaluación previa, se cambia el estado del proyecto
      if(!evaluacion){
        // Completar validación sobre si el proyecto está en instancia regional
        if (proyecto.estado != (estado.promovidoProvincial)){
          return res.status(401).json({ error: "Este proyecto no puede ser evaluado porque no se encuentra en instancia provincial" });
        }
        proyecto.estado = estado.enEvaluacionProvincial;
        proyecto.save()
      }

      // Obtengo la estructura de rubricas sólo para la evaluación de exposición
      const evaluacion_estructura_exposicion = [];
      for (const rubrica of evaluacion_estructura) {
        if (rubrica.exposicion) {
          // Copiar la rubrica eliminando los atributos no deseados
          const rubricaExposicion = {
            _id: rubrica._id,
            nombreRubrica: rubrica.nombreRubrica,
            criterios: rubrica.criterios.map((criterio) => {
              // Copiar el criterio eliminando los atributos no deseados
              const criterioSinPonderacion = {
                _id: criterio._id,
                nombre: criterio.nombre,
                opciones: criterio.opciones.map((opcion) => {
                  // Copiar la opción eliminando el atributo "puntaje"
                  const { puntaje, ...opcionSinPuntaje } = opcion.toObject();
                  return opcionSinPuntaje;
                  
                }),
              };
              return criterioSinPonderacion;
            }),
          };
          evaluacion_estructura_exposicion.push(rubricaExposicion);
        }
      }
  
      if(!evaluacion){
        // Creo una nueva evaluación de exposición de proyecto
        const evaluacion_proyecto = new EvaluacionExposicionProvincial({
          evaluacion: null,
          evaluadorId: [],
          proyectoId: proyecto.id,
          puntajeExposicion: -1,
          puntajeFinal: -1,
          listo: [],
          estado: estadoEvaluacionExposicionProvincial.enEvaluacion,
          ultimaEvaluacion: null,
          evaluando: evaluador.id
        })
        evaluacion_proyecto.save();
      }
  
  
      // Devolver la estructura de evaluación de exposicion con o sin evaluacion existente
      return res.json(evaluacion_estructura_exposicion);
  
  
    } else {
  
        // EN CASO DE QUE EL EVALUADOR NO SEA EL USUARIO QUE ESTA EVALUANDO ACTUALMENTE, NO SE PERMITE EVALUAR
        if(evaluacion.estado == estadoEvaluacionExposicionProvincial.enEvaluacion && evaluacion.evaluando.toString() != evaluador._id.toString()) {
            return res.status(403).json({ error: "Un usuario ya está evaluando el proyecto en este momento. Por favor, espera hasta que finalice su evaluacion" });
        
        } else {
  
  
            // No se puede evaluar un proyecto con evaluación finalizada
            if(evaluacion.estado == estadoEvaluacionExposicionProvincial.cerrada) {
              return res.status(422).json({ error: "La evaluación de este proyecto ya ha finalizado" });
            }
    
            // Si existe evaluación, construir la estructura con "seleccionada"
            const evaluacion_estructura_exposicion = evaluacion_estructura
            .filter((rubrica) => rubrica.exposicion)
            .map((rubrica) => {
                
                // Buscamos en la evaluación encontrada, cual es el comentario realizado para la rubrica actual
                const comentario = evaluacion.comentarios.find(
                (comentarioRubrica) => 
                    comentarioRubrica.rubricaId.toString() ===
                    rubrica._id.toString())
    
                // Copiar la rubrica eliminando los atributos no deseados
                const rubricaConSeleccionada = {
                _id: rubrica._id,
                nombreRubrica: rubrica.nombreRubrica,
                comentario: comentario?.comentario,
                criterios: rubrica.criterios.map((criterio) => {
    
                    // Buscamos en la evaluacion encontrada, cual es la opcion seleccionada del criterio actual
                    const opcionSeleccionada = evaluacion.evaluacion.find(
                    (evaluacionItem) =>
                        evaluacionItem.rubricaId.toString() ===
                        rubrica._id.toString() &&
                        evaluacionItem.criterioId.toString() ===
                        criterio._id.toString())
    
                    // Copiar el criterio eliminando los atributos no deseados
                    const criterioConSeleccionada = {
                    _id: criterio._id,
                    nombre: criterio.nombre,
                    seleccionada: opcionSeleccionada.opcionSeleccionada, // Inicializamos la propiedad seleccionada
                    opciones: criterio.opciones.map((opcion) => {
                        const opcionConSeleccionada = {
                            nombre: opcion.nombre,
                            _id: opcion._id
                        }
                        return opcionConSeleccionada;
                        }
                    )
                    }
                    return criterioConSeleccionada;
                    },
                    ),
                };
                return rubricaConSeleccionada;
            });
    
            if(evaluacion.estado != estadoEvaluacionExposicionProvincial.enEvaluacion) {
            evaluacion.estado = estadoEvaluacionExposicionProvincial.enEvaluacion;
            evaluacion.evaluando = evaluador.id;
            evaluacion.save()
            }

            // Devolver la estructura de evaluación de exposicion con o sin evaluacion existente
            return res.json(evaluacion_estructura_exposicion);
        }
    };
};


// Funcion para cancelar una evaluacion de exposicion ------------------------------------------------------------------------------------------
export const cancelarEvaluacionExposicion = async (req, res) =>  {

  try {
    const proyecto = req.proyecto;
    const evaluador = req.evaluador;
    const feria = req.feria;

    const evaluacion_pendiente = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto.id, estado: estadoEvaluacionExposicionProvincial.enEvaluacion})
    if(!evaluacion_pendiente) {
      return res.status(401).json({ error: "No existe una evaluación pendiente para este proyecto" });
    }

    if(evaluacion_pendiente.evaluando.toString() != evaluador._id.toString()){
      return res.status(401).json({ error: "No puedes cancelar la evaluación si no eres el usuario que está evaluando en este momento" });
    }

    if(evaluacion_pendiente.evaluacion == null){
      evaluacion_pendiente.deleteOne()
    } else {
      evaluacion_pendiente.evaluando = null;
      evaluacion_pendiente.estado = estadoEvaluacionExposicionProvincial.abierta;

      evaluacion_pendiente.save();
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Error de servidor" });
  }
}




// Funcion para visualizar una evaluacion realizada -------------------------------------------------------------------------------------
export const visualizarEvaluacionExposicion = async (req, res) => {
  const feria = req.feria;
  const proyecto = req.proyecto;
  const evaluacion = await EvaluacionExposicionProvincial.findOne({ proyectoId: proyecto.id });

  // Obtengo la estructura de rubricas de la feria
  const evaluacion_estructura = feria.criteriosEvaluacion;

  // Si no existe evaluación, construye la estructura sin "seleccionada"
  if (!evaluacion || evaluacion.evaluacion == null) {

    // Obtengo la estructura de rubricas sólo para la evaluación de exposición
    const evaluacion_estructura_exposicion = [];
    for (const rubrica of evaluacion_estructura) {
      if (rubrica.exposicion) {
        // Copiar la rubrica eliminando los atributos no deseados
        const rubricaTeorica = {
          _id: rubrica._id,
          nombreRubrica: rubrica.nombreRubrica,
          criterios: rubrica.criterios.map((criterio) => {
            // Copiar el criterio eliminando los atributos no deseados
            const criterioSinPonderacion = {
              _id: criterio._id,
              nombre: criterio.nombre,
              opciones: criterio.opciones.map((opcion) => {
                // Copiar la opción eliminando el atributo "puntaje"
                const { puntaje, ...opcionSinPuntaje } = opcion.toObject();
                return opcionSinPuntaje;
                
              }),
            };
            return criterioSinPonderacion;
          }),
        };
        evaluacion_estructura_exposicion.push(rubricaTeorica);
      }
    }

    // Devolver la estructura de evaluación teórica con o sin evaluacion existente
    return res.json(evaluacion_estructura_exposicion);


} else {// Si existe evaluación, construir la estructura con "seleccionada"
  const evaluacion_estructura_exposicion = evaluacion_estructura
  .filter((rubrica) => rubrica.exposicion)
  .map((rubrica) => {
      
      // Buscamos en la evaluación encontrada, cual es el comentario realizado para la rubrica actual
      const comentario = evaluacion.comentarios.find(
        (comentarioRubrica) => 
          comentarioRubrica.rubricaId.toString() ===
            rubrica._id.toString())

      // Copiar la rubrica eliminando los atributos no deseados
      const rubricaConSeleccionada = {
        _id: rubrica._id,
        nombreRubrica: rubrica.nombreRubrica,
        comentario: comentario?.comentario,
        criterios: rubrica.criterios.map((criterio) => {

          // Buscamos en la evaluacion encontrada, cual es la opcion seleccionada del criterio actual
          const opcionSeleccionada = evaluacion.evaluacion.find(
            (evaluacionItem) =>
              evaluacionItem.rubricaId.toString() ===
                rubrica._id.toString() &&
              evaluacionItem.criterioId.toString() ===
                criterio._id.toString())

          // Copiar el criterio eliminando los atributos no deseados
          const criterioConSeleccionada = {
            _id: criterio._id,
            nombre: criterio.nombre,
            seleccionada: opcionSeleccionada.opcionSeleccionada, // Inicializamos la propiedad seleccionada
            opciones: criterio.opciones.map((opcion) => {
                const opcionConSeleccionada = {
                  nombre: opcion.nombre,
                  _id: opcion._id
                }
                return opcionConSeleccionada;
              }
            )
          }
          return criterioConSeleccionada;
          },
          ),
        };
        return rubricaConSeleccionada;
      });

      // Devolver la estructura de evaluación de exposicion con o sin evaluacion existente
      return res.json(evaluacion_estructura_exposicion);

  }
}


// Funcion para evaluar exposicion de un proyecto -----------------------------------------------------------------------------------------
export const evaluarExposicionProyecto = async (req, res) => {
  const evaluacion = req.body.evaluacion;
  const comentarios = req.body.comentarios;
  const proyecto = req.proyecto;
  const evaluador = req.evaluador;
  const feria = req.feria;


  const evaluacion_anterior = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto.id})
  if(!evaluacion_anterior) {
    return res.status(401).json({ error: "No puedes enviar una evaluación porque ningún usuario estaba evaluando el proyecto" });
  }

  if(evaluacion_anterior.evaluando == null){
    return res.status(401).json({ error: "No puedes enviar una evaluación porque ningún usuario estaba evaluando el proyecto" });
  }

  if(evaluacion_anterior.evaluando.toString() !== evaluador.id.toString()){
    return res.status(401).json({ error: "No puedes enviar una evaluación ya que no eres el usuario que estaba evaluando" });
  }

  // Obtengo la estructura de rubricas de la feria
  const evaluacion_estructura = feria.criteriosEvaluacion;

  // Obtengo la estructura de rubricas sólo para la evaluacion de exposicion
  const evaluacion_estructura_exposicion = [];
  for(const rubrica of evaluacion_estructura){
      if(rubrica.exposicion)
        evaluacion_estructura_exposicion.push(rubrica)
  }
  
  // En caso de que no exista una evaluación anterior realizada por el mismo o por otro evaluador
  if(evaluacion_anterior.evaluacion == null){

    evaluacion_anterior.evaluacion = evaluacion;
    evaluacion_anterior.comentarios = comentarios;
    evaluacion_anterior.evaluadorId = [evaluador.id];
    evaluacion_anterior.puntajeExposicion = obtenerPuntaje(Object.values(evaluacion), evaluacion_estructura_exposicion);
    //evaluacion_anterior.puntajeFinal = obtenerPuntajeFinalProvincial(evaluacion_anterior.puntajeExposicion)
    evaluacion_anterior.ultimaEvaluacion = evaluador.id;
    evaluacion_anterior.evaluando = null;
    evaluacion_anterior.estado = estadoEvaluacionExposicionProvincial.abierta;

    evaluacion_anterior.save();

    // En caso de que sí exista una evaluación anterior realizada por el mismo o por otro evaluador
  } else {

    // COMPROBAR SI SE MODIFICO LA EVALUACION ANTERIOR PARA QUITAR LOS "LISTO"
    if(!arraysEvaluacionIguales(evaluacion_anterior.evaluacion, evaluacion) || !arraysComentariosIguales(evaluacion_anterior.comentarios, comentarios)){
      evaluacion_anterior.listo = [];
    }

    evaluacion_anterior.evaluacion = evaluacion;
    evaluacion_anterior.comentarios = comentarios;

    // En caso de que no haya evaluado, se añade al array de evaluadores que ya han evaluado el proyecto
    if(!evaluacion_anterior.evaluadorId.includes(evaluador.id)){
      evaluacion_anterior.evaluadorId.push(evaluador.id);
    }
    
    evaluacion_anterior.puntajeExposicion = obtenerPuntaje(Object.values(evaluacion), evaluacion_estructura_exposicion);
    //evaluacion_anterior.puntajeFinal = obtenerPuntajeFinalProvincial(evaluacion_anterior.puntajeExposicion)
    evaluacion_anterior.ultimaEvaluacion = evaluador.id;
    evaluacion_anterior.evaluando = null;
    evaluacion_anterior.estado = estadoEvaluacionExposicionProvincial.abierta;

    evaluacion_anterior.save()

  }

  return res.json({ ok: true,  evaluacion: evaluacion_anterior});
  
}

const obtenerPuntajeFinalProvincial = (puntaje_regional, puntaje_exposicion) => {
  return puntaje_regional + puntaje_exposicion
}



// Funcion para confirmar (Listo) la evaluación de exposición de un proyecto -----------------------------------------------------------------------
export const confirmarEvaluacionExposicion = async (req, res) => {
  const proyecto = req.proyecto;
  const evaluador = req.evaluador;
  let responseMessage = "Se ha confirmado la evaluación"

  const evaluacion_anterior = await EvaluacionExposicionProvincial.findOne({proyectoId: proyecto.id})
  if(proyecto.evaluadoresRegionales.length !== evaluacion_anterior.evaluadorId.length){
    return res.status(401).json({ error: "No puedes confirmar una evaluación de exposición hasta que todos los evaluadores asignados hayan evaluado el proyecto" });
  }

  if(evaluacion_anterior.listo.includes(evaluador.id)){
    return res.status(401).json({ error: "Ya has confirmado la evaluación anteriormente" });
  }

  evaluacion_anterior.listo.push(evaluador.id)

  if(evaluacion_anterior.listo.length == evaluacion_anterior.evaluadorId.length) {
    evaluacion_anterior.estado = estadoEvaluacionExposicionProvincial.cerrada;
    proyecto.estado = estado.evaluadoProvincial;
    responseMessage = `Todos los evaluadores han confirmado la evaluación. La evaluación del proyecto '${proyecto.titulo}' ha finalizado`;
  }

  proyecto.save()
  evaluacion_anterior.save()

  return res.json({ ok: true , responseMessage });

}