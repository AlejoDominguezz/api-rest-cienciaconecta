import { buscarPor, formatearSalida, obtenerPromedioConColor } from "../services/reportes/puntajePromedio_services.js";


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
            puntajePromedio = await formatearSalida("categoria", promedios)

          } else if (filtro == "nivel"){
            
            const proyectosPorNivel = await buscarPor("nivel", filter);
            promedios = await obtenerPromedioConColor("nivel", proyectosPorNivel);
            puntajePromedio = await formatearSalida("nivel", promedios)


          } else if (filtro == "departamento"){
            const proyectosPorDepto = await buscarPor("departamento", filter);
            promedios = await obtenerPromedioConColor("departamento", proyectosPorDepto);
            puntajePromedio = await formatearSalida("departamento", promedios)
          }

          return res.json({data: puntajePromedio});

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error de servidor" });
    }
}

