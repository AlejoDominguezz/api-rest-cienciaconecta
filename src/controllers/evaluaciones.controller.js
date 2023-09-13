import { Evaluacion } from "../models/Evaluacion.js";

export const evaluarProyecto = async (req, res) => {
    const evaluacion = req.body;
    const proyecto = req.proyecto;
    const evaluador = req.evaluador;
    const feria = req.feria;
    
    // Obtengo la estructura de rubricas de la feria
    const evaluacion_estructura = feria.criteriosEvaluacion;

    // Obtengo la estructura de rubricas sólo para la evaluacion teórica
    const evaluacion_estructura_teorica = [];
    for(const rubrica of evaluacion_estructura){
        if(!rubrica.exposicion)
            evaluacion_estructura_teorica.push(rubrica)
    }

    // Creo una nueva evaluación de proyecto
    const evaluacion_proyecto = new Evaluacion({
        evaluacion,
        evaluadorId: evaluador.id,
        proyectoId: proyecto.id,
        puntaje: obtenerPuntaje(evaluacion, evaluacion_estructura_teorica),
    })

    evaluacion_proyecto.save();

    return res.json({ ok: true,  evaluacion: evaluacion_proyecto});
}
  

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