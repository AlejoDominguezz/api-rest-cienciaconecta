import { Evaluacion, estadoEvaluacion } from "../models/Evaluacion.js";
import { arraysEvaluacionIguales, arraysComentariosIguales } from "../helpers/arrayComparation.js"

export const evaluarProyecto = async (req, res) => {
    const evaluacion = req.body.evaluacion;
    const comentarios = req.body.comentarios;
    const proyecto = req.proyecto;
    const evaluador = req.evaluador;
    const feria = req.feria;

    const evaluacion_anterior = await Evaluacion.findOne({proyectoId: proyecto.id})

    if(evaluacion_anterior.evaluando == null){
      return res.status(401).json({ error: "No puedes enviar una evaluación porque ningún usuario estaba evaluando el proyecto" });
    }

    if(evaluacion_anterior.evaluando.toString() !== evaluador.id.toString()){
      return res.status(401).json({ error: "No puedes enviar una evaluación ya que no eres el usuario que estaba evaluando" });
    }

    // Obtengo la estructura de rubricas de la feria
    const evaluacion_estructura = feria.criteriosEvaluacion;

    // Obtengo la estructura de rubricas sólo para la evaluacion teórica
    const evaluacion_estructura_teorica = [];
    for(const rubrica of evaluacion_estructura){
        if(!rubrica.exposicion)
            evaluacion_estructura_teorica.push(rubrica)
    }
    
    // En caso de que no exista una evaluación anterior realizada por el mismo o por otro evaluador
    if(evaluacion_anterior.evaluacion == null){

      evaluacion_anterior.evaluacion = evaluacion;
      evaluacion_anterior.comentarios = comentarios;
      evaluacion_anterior.evaluadorId = [evaluador.id];
      evaluacion_anterior.puntajeTeorico = obtenerPuntaje(Object.values(evaluacion), evaluacion_estructura_teorica);
      evaluacion_anterior.ultimaEvaluacion = evaluador.id;
      evaluacion_anterior.evaluando = null;
      evaluacion_anterior.estado = estadoEvaluacion.abierta;

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
      
      evaluacion_anterior.puntajeTeorico = obtenerPuntaje(Object.values(evaluacion), evaluacion_estructura_teorica);
      evaluacion_anterior.ultimaEvaluacion = evaluador.id;
      evaluacion_anterior.evaluando = null;
      evaluacion_anterior.estado = estadoEvaluacion.abierta;

      evaluacion_anterior.save()

    }

    return res.json({ ok: true,  evaluacion: evaluacion_anterior});
    
}
  
// Funcion para obtener puntaje de una evaluacion teorica ---------------------------------------------------------------------------
  const obtenerPuntaje = (evaluacion, estructuraCriterios) => {
    let puntajeTotal = 0;
  
    for (const rubricaPos in estructuraCriterios) {
      const rubrica = estructuraCriterios[rubricaPos];
      const rubricaId = rubrica._id;
  
      const evaluacionItems = evaluacion.filter((item) => item.rubricaId.toString() === rubricaId.toString());

      if (evaluacionItems) {
        let puntajeRubrica = 0;
        
        for(const criterioPos in rubrica.criterios) {
          const criterio = rubrica.criterios[criterioPos]
          const criterioId = criterio._id;

          const criterioItem = evaluacionItems.find((item) => item.criterioId.toString() === criterioId.toString());

          if (criterioItem) {
            const opcionSeleccionada = criterioItem.opcionSeleccionada;
            const opcion = criterio.opciones.find((opcion) => opcion._id.toString() === opcionSeleccionada.toString());
  
            if (opcion) {
              const puntajeCriterio = (opcion.puntaje * criterio.ponderacion) / 100;
              puntajeRubrica += puntajeCriterio;
            }
          }
        };
  
        puntajeTotal += (puntajeRubrica * rubrica.ponderacion) / 100;
      }
    };
  
    return parseFloat(puntajeTotal.toFixed(2));
  };


// Obtener estructura de evaluacion, exista o no una evaluacion previa -------------------------------------------------------
export const getEstructuraEvaluacion = async (req, res) => {
  const feria = req.feria;
  const proyecto = req.proyecto;
  const evaluador = req.evaluador;
  const evaluacion = await Evaluacion.findOne({ proyectoId: proyecto.id });

  // Obtengo la estructura de rubricas de la feria
  const evaluacion_estructura = feria.criteriosEvaluacion;

  // Si no existe evaluación, construye la estructura sin "seleccionada"
  if (!evaluacion) {

    // Obtengo la estructura de rubricas sólo para la evaluación teórica
    const evaluacion_estructura_teorica = [];
    for (const rubrica of evaluacion_estructura) {
      if (!rubrica.exposicion) {
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
        evaluacion_estructura_teorica.push(rubricaTeorica);
      }
    }

    // Creo una nueva evaluación de proyecto
    const evaluacion_proyecto = new Evaluacion({
      evaluacion: null,
      evaluadorId: [],
      proyectoId: proyecto.id,
      puntajeTeorico: -1,
      listo: [],
      estado: estadoEvaluacion.enEvaluacion,
      ultimaEvaluacion: null,
      evaluando: evaluador.id
    })

    evaluacion_proyecto.save();

    // Devolver la estructura de evaluación teórica con o sin evaluacion existente
    return res.json(evaluacion_estructura_teorica);


  } else {

    // Dos evaluadores no pueden evaluar un proyecto al mismo tiempo
    if(evaluacion.estado == estadoEvaluacion.enEvaluacion) {
      return res.status(401).json({ error: "Un usuario ya está evaluando el proyecto en este momento. Por favor, espera hasta que finalice su evaluacion" });
    }

    // No se puede evaluar un proyecto con evaluación finalizada
    if(evaluacion.estado == estadoEvaluacion.cerrada) {
      return res.status(401).json({ error: "La evaluación de este proyecto ya ha finalizado" });
    }

    // Si existe evaluación, construir la estructura con "seleccionada"
    const evaluacion_estructura_teorica = evaluacion_estructura.map(
      (rubrica) => {
        
        // Buscamos en la evaluación encontrada, cual es el comentario realizado para la rubrica actual
        const comentario = evaluacion.comentarios.find(
          (comentarioRubrica) => 
            comentarioRubrica.rubricaId.toString() ===
              rubrica._id.toString())

        // Copiar la rubrica eliminando los atributos no deseados
        const rubricaConSeleccionada = {
          _id: rubrica._id,
          nombreRubrica: rubrica.nombreRubrica,
          comentario: comentario,
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
              seleccionada: opcionSeleccionada, // Inicializamos la propiedad seleccionada
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

        evaluacion.estado = estadoEvaluacion.enEvaluacion;
        evaluacion.evaluando = evaluador.id;
        evaluacion.save()

        // Devolver la estructura de evaluación teórica con o sin evaluacion existente
        return res.json(evaluacion_estructura_teorica);

  };
    
};


export const confirmarEvaluacion = async (req, res) => {
  const proyecto = req.proyecto;
  const evaluador = req.evaluador;
  let responseMessage = "Se ha confirmado la evaluación"

  const evaluacion_anterior = await Evaluacion.findOne({proyectoId: proyecto.id})
  if(proyecto.evaluadoresRegionales.length !== evaluacion_anterior.evaluadorId.length){
    return res.status(401).json({ error: "No puedes confirmar una evaluación hasta que todos los evaluadores asignados hayan evaluado el proyecto" });
  }

  if(evaluacion_anterior.listo.includes(evaluador.id)){
    return res.status(401).json({ error: "Ya has confirmado la evaluación anteriormente" });
  }

  evaluacion_anterior.listo.push(evaluador.id)

  if(evaluacion_anterior.listo.length == evaluacion_anterior.evaluadorId.length) {
    evaluacion_anterior.estado = estadoEvaluacion.cerrada;
    responseMessage = `Todos los evaluadores han confirmado la evaluación. La evaluación del proyecto '${proyecto.titulo}' ha finalizado`;
  }

  evaluacion_anterior.save()

  return res.json({ ok: true , responseMessage });

}


// Funcion para visualizar una evaluacion realizada ------------------------------------------------------------------------
export const visualizarEvaluacion = async (req, res) => {
  const feria = req.feria;
  const proyecto = req.proyecto;
  const evaluacion = await Evaluacion.findOne({ proyectoId: proyecto.id });

  // Obtengo la estructura de rubricas de la feria
  const evaluacion_estructura = feria.criteriosEvaluacion;

  // Si no existe evaluación, construye la estructura sin "seleccionada"
  if (!evaluacion || evaluacion.evaluacion == null) {

    // Obtengo la estructura de rubricas sólo para la evaluación teórica
    const evaluacion_estructura_teorica = [];
    for (const rubrica of evaluacion_estructura) {
      if (!rubrica.exposicion) {
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
        evaluacion_estructura_teorica.push(rubricaTeorica);
      }
    }

    // Devolver la estructura de evaluación teórica con o sin evaluacion existente
    return res.json(evaluacion_estructura_teorica);


} else {// Si existe evaluación, construir la estructura con "seleccionada"
  const evaluacion_estructura_teorica = evaluacion_estructura.map(
    (rubrica) => {
      
      // Buscamos en la evaluación encontrada, cual es el comentario realizado para la rubrica actual
      const comentario = evaluacion.comentarios.find(
        (comentarioRubrica) => 
          comentarioRubrica.rubricaId.toString() ===
            rubrica._id.toString())

      // Copiar la rubrica eliminando los atributos no deseados
      const rubricaConSeleccionada = {
        _id: rubrica._id,
        nombreRubrica: rubrica.nombreRubrica,
        comentario: comentario,
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
            seleccionada: opcionSeleccionada, // Inicializamos la propiedad seleccionada
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

      // Devolver la estructura de evaluación teórica con o sin evaluacion existente
      return res.json(evaluacion_estructura_teorica);

  }
}


export const cancelarEvaluacion = async (req, res) =>  {

  try {
    const proyecto = req.proyecto;
    const evaluador = req.evaluador;
    const feria = req.feria;

    const evaluacion_pendiente = await Evaluacion.findOne({proyectoId: proyecto.id, estado: estadoEvaluacion.enEvaluacion})
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
      evaluacion_pendiente.estado = estadoEvaluacion.abierta;

      evaluacion_pendiente.save();
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Error de servidor" });
  }
}