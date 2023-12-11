import _ from "lodash";
import { Categoria } from "../../models/Categoria.js";
import { EstablecimientoEducativo } from "../../models/EstablecimientoEducativo.js";
import { Nivel } from "../../models/Nivel.js";
import { Proyecto } from "../../models/Proyecto.js";

export const buscarPor = async (tipo, filtro) => {
    const proyectos = await Proyecto.find(filtro)
    if(proyectos.length == 0) {
        return []
    }

    if (tipo == "departamento") {

        const proyectosConEstablecimiento = await Promise.all(
            proyectos.map(async (proyecto) => {
                const establecimiento = await EstablecimientoEducativo.findById(proyecto.establecimientoEducativo)
                    .select("-__v -provincia -domicilio -CP -telefono -email -niveles -ferias")
                    .lean()
                    .exec()
                proyecto = proyecto.toObject()
                proyecto.establecimientoEducativo = establecimiento
                return proyecto
                   }
            )
        );

        const proyectosPorTipo = _.groupBy(proyectosConEstablecimiento, "establecimientoEducativo.departamento");
        return proyectosPorTipo;
    }

    // Organizar proyectos por tipo (categoria, nivel, departamento) usando lodash
    const proyectosPorTipo = _.groupBy(proyectos, tipo);
    return proyectosPorTipo;
}


export const obtenerTodasClases = async (tipo) => {
    let todasClases = null;

    if(tipo == "categoria"){
        todasClases = await Categoria.find({$or: [
            { activa: true },
            { activa: { $exists: false } } 
        ]}).lean().exec();

    } else if (tipo == "nivel") {

        todasClases = await Nivel.find().lean().exec();
        todasClases.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));

    } else if (tipo == "departamento"){

        const departamentosAggregation = await EstablecimientoEducativo.aggregate([
            { $group: { _id: "$departamento" } },
            { $project: { _id: 0, departamento: "$_id" } }
        ]);
    
        todasClases = departamentosAggregation.map(item => item.departamento);
        todasClases.sort((a, b) => a.localeCompare(b));
    }

    return todasClases;
}
