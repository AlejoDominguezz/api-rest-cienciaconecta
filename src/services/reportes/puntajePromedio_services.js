import { Proyecto } from "../../models/Proyecto.js";
import { EvaluacionExposicion } from "../../models/EvaluacionExposicion.js"
import _ from 'lodash';
import { EstablecimientoEducativo } from "../../models/EstablecimientoEducativo.js";
import { Categoria } from "../../models/Categoria.js";
import { Nivel } from "../../models/Nivel.js";
import { capitalizarPalabras } from "../../helpers/capitalizarPalabras.js"


export const buscarPor = async (tipo, filtro) => {
    const proyectos = await Proyecto.find(filtro)
    if(proyectos.length == 0) {
        return res.status(204).json({})
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





export const obtenerPromedioConColor = async (tipo, proyectosPorClase) => {
    if(tipo == "categoria" || tipo == "nivel"){
        return await obtenerPromedioColorNivelCategoria(tipo, proyectosPorClase)
    } else if(tipo == "departamento"){
        return await obtenerPromedioColorDepartamento(proyectosPorClase)
    }
}


const obtenerPromedioColorNivelCategoria = async (tipo, proyectosPorClase) => {
    const resultados = [];
    
    // Obtener todas las categorías o niveles de la base de datos
    const todasClases = await (tipo === "categoria" ? Categoria.find() : Nivel.find()).lean().exec();
    if (tipo === "nivel") {
        todasClases.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
    }

    // Recorrer todas las categorías o niveles
    for (const clase of todasClases) {
        const idClase = clase._id.toString();

        // Obtener proyectos para la categoría o nivel actual
        const proyectos = proyectosPorClase[idClase] || [];

        // Sumar puntajes de cada categoría, puntaje final de exposición regional
        let sumaPuntaje = 0;
        
        for (const proyecto of proyectos) {
            const evaluacion = await EvaluacionExposicion.findOne({ proyectoId: proyecto._id });
            if (evaluacion) {
                sumaPuntaje += evaluacion.puntajeFinal;
            }
        }

        // Obtener el promedio de la categoría o nivel actual
        let promedioClase = proyectos.length > 0 ? sumaPuntaje / proyectos.length : 0;
        promedioClase = parseFloat(promedioClase.toFixed(2))

        // Añadir la información de color al resultado
        const resultado = {
            nombre: clase.abreviatura,
            promedio: promedioClase.toString(),
            color: clase.color || 'Color Desconocido'
        };

        resultados.push(resultado);
    }

    return resultados;
}


const obtenerPromedioColorDepartamento = async (proyectosPorDepto) => {
    const resultados = [];
    
    // Obtener todos los departamentos de la base de datos
    const departamentosAggregation = await EstablecimientoEducativo.aggregate([
        { $group: { _id: "$departamento" } },
        { $project: { _id: 0, departamento: "$_id" } }
    ]);

    let departamentos = departamentosAggregation.map(item => item.departamento);
    departamentos.sort((a, b) => a.localeCompare(b));

    // Recorrer todos los departamento
    for (const depto of departamentos) {

        // Obtener proyectos para el departamento actual
        const proyectos = proyectosPorDepto[depto] || [];
        //console.log(proyectosPorDepto)

        // Sumar puntajes de cada departamento, puntaje final de exposición regional
        let sumaPuntaje = 0;
        
        for (const proyecto of proyectos) {
            const evaluacion = await EvaluacionExposicion.findOne({ proyectoId: proyecto._id });
            if (evaluacion) {
                sumaPuntaje += evaluacion.puntajeFinal;
            }
        }

        // Obtener el promedio del departamento actual
        let promedioDepto = proyectos.length > 0 ? sumaPuntaje / proyectos.length : 0;
        promedioDepto = parseFloat(promedioDepto.toFixed(2));

        // Añadir la información de color al resultado
        const resultado = {
            nombre: capitalizarPalabras(depto),
            promedio: promedioDepto.toString(),
            //color: '#00ACE6' || 'Color Desconocido'
        };

        resultados.push(resultado);
    }

    return resultados;
}





export const formatearSalida = (tipo, promedios) => {
    
    const labels = promedios.map(item => item.nombre);
    const data = promedios.map(item => item.promedio);
    const backgroundColor = promedios.map(item => item.color);

    let datasets = {}
    if(tipo == "departamento"){
        datasets = {
            label: `Puntaje Promedio por ${tipo}`,
            data,
        };
    } else {
        datasets = {
            label: `Puntaje Promedio por ${tipo}`,
            data,
            backgroundColor
        };
    }
   

    return { labels, datasets };
}