import { Evaluacion } from "../models/Evaluacion.js";

export const evaluarProyecto = async (req, res) => {
    const evaluacion = req.body.evaluacion;
    const comentarios = req.body.comentarios;
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
        comentarios,
        evaluadorId: evaluador.id,
        proyectoId: proyecto.id,
        puntaje: obtenerPuntaje(Object.values(evaluacion), evaluacion_estructura_teorica),
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


// export const getEstructuraEvaluacion = async (req, res) => {
  
//   const feria = req.feria;
//   const proyecto = req.proyecto;
//   const evaluacion = await Evaluacion.find({proyectoId: proyecto.id})
  
//   // Si no existe, mandamos la estructura sin opciones seleccionada.
//   if(!evaluacion) {
//     // Obtengo la estructura de rubricas de la feria
//     const evaluacion_estructura = feria.criteriosEvaluacion;

//     // Obtengo la estructura de rubricas sólo para la evaluación teórica
//     const evaluacion_estructura_teorica = [];
//     for (const rubrica of evaluacion_estructura) {
//       if (!rubrica.exposicion) {
//         // Copiar la rubrica eliminando los atributos no deseados
//         const rubricaSinExposicion = {
//           nombreRubrica: rubrica.nombreRubrica,
//           criterios: rubrica.criterios.map((criterio) => {
//             // Copiar el criterio eliminando los atributos no deseados
//             const criterioSinPonderacion = {
//               nombre: criterio.nombre,
//               opciones: criterio.opciones.map((opcion) => {
//                 // Copiar la opción eliminando el atributo "puntaje"
//                 const { puntaje, ...opcionSinPuntaje } = opcion;
//                 return opcionSinPuntaje;
//               }),
//             };
//             return criterioSinPonderacion;
//           }),
//         };
//         evaluacion_estructura_teorica.push(rubricaSinExposicion);
//       }
//     }
//   } else {

//   }
//    // Devolver la estructura de evaluación teórica
//    res.json(evaluacion_estructura_teorica);
// };


export const getEstructuraEvaluacion = async (req, res) => {
  const feria = req.feria;
  const proyecto = req.proyecto;
  const evaluacion = await Evaluacion.findOne({ proyectoId: proyecto.id });

  // Obtengo la estructura de rubricas de la feria
  const evaluacion_estructura = feria.criteriosEvaluacion;

  // Si no existe evaluación, construye la estructura sin "seleccionada"
  if (!evaluacion || evaluacion.length === 0) {

    // Obtengo la estructura de rubricas sólo para la evaluación teórica
    const evaluacion_estructura_teorica = [];
    for (const rubrica of evaluacion_estructura) {
      if (!rubrica.exposicion) {
        // Copiar la rubrica eliminando los atributos no deseados
        const rubricaTeorica = {
          nombreRubrica: rubrica.nombreRubrica,
          criterios: rubrica.criterios.map((criterio) => {
            // Copiar el criterio eliminando los atributos no deseados
            const criterioSinPonderacion = {
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
    return res.json(evaluacion_estructura_teorica);


  } else {

    // Si existe evaluación, construir la estructura con "seleccionada"
    const evaluacion_estructura_con_seleccionada = evaluacion_estructura.map(
      (rubrica) => {
        // Copiar la rubrica eliminando los atributos no deseados
        const rubricaConSeleccionada = {
          nombreRubrica: rubrica.nombreRubrica,
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

        // Devolver la estructura de evaluación teórica con "seleccionada"
      return res.json(evaluacion_estructura_con_seleccionada);
  };
    
};



