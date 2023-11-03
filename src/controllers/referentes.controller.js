import { roles } from "../helpers/roles.js";
import { Docente } from "../models/Docente.js";
import { Evaluador } from "../models/Evaluador.js";
import { estadoFeria, fechasFeria } from "../models/Feria.js";
import { Proyecto, estado } from "../models/Proyecto.js";
import { Referente } from "../models/Referente.js";
import { Usuario, estadoUsuario } from "../models/Usuario.js";
import { getFeriaActivaFuncion } from "./ferias.controller.js";

export const seleccionarReferentes = async (req, res) => {
    try {
        const {seleccion} = req.body;

        const feriaActiva = await getFeriaActivaFuncion()

        // Buscar y eliminar todos los referentes de la feria activa
        const referentesEliminados = await Referente.find({ feria: feriaActiva._id });
        await Referente.deleteMany({ feria: feriaActiva._id });

        for (const referenteEliminado of referentesEliminados) {
        // Buscar el docente relacionado con el referente eliminado
        const docente = await Docente.findById(referenteEliminado.idDocente);

        if (docente) {
            // Buscar el usuario relacionado con el docente
            const usuario = await Usuario.findById(docente.usuario);

            if (usuario) {
            // Quitar el rol roles.refEvaluador al usuario
            if (usuario.roles.includes(roles.refEvaluador)) {
                usuario.roles = usuario.roles.filter((rol) => rol !== roles.refEvaluador);
                await usuario.save();
            }
            }
        }
        }

        // Asignación de nuevos referentes de evaluador
        for (const obj of seleccion) {

            // Solo se crean referentes que sean distintos de null
            if (obj.referente !== null) {

              // Si se envía un referente, crear un nuevo referente y asignar la sede.
                const docente = await Docente.findById(obj.referente)
                if(!docente){
                    return res.status(401).json({ error: `${obj.referente} no es un ID de un docente registrado` });
                }

                const usuario = await Usuario.findById(docente.usuario)
                if(!usuario){
                    return res.status(401).json({ error: `${obj.referente} no tiene asociado a un usuario registrado` });
                }

                // Creación de referente
                const referente = new Referente({
                    sede: obj.sede,
                    idDocente: obj.referente,
                    feria: feriaActiva._id,
                });
                
                // Modificación de roles
                if(usuario.roles.includes(roles.evaluador)){
                    usuario.roles.push(roles.refEvaluador)
                    usuario.roles = usuario.roles.filter(rol => rol !== roles.evaluador);
                } else {
                    usuario.roles.push(roles.refEvaluador)
                }

                usuario.save()
                referente.save()

            }
        }

        return res.json({msg: "Se han seleccionado todos los referentes correctamente"}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }

}


export const obtenerReferentesSeleccionados = async (req, res) => {
    try {
        const feriaActiva = await getFeriaActivaFuncion()

        const referentesAsignados = await Referente.find({feria: feriaActiva._id})
        .select('-__v -feria')
        .lean()
        .exec();

        const referentesConDatosDocente = await Promise.all(
            referentesAsignados.map(async (referente) => {
                const docente = await Docente.findById(referente.idDocente)
                .select('-__v -_id')
                .lean()
                .exec();

                if (!docente) {
                    return res.status(401).json({ error: `${referente._id} no tiene asociado a un docente registrado` });
                }
                return {
                    ...referente,
                    datos_docente: docente,
                }
            })
        )


    return res.json({referentes: referentesConDatosDocente}); 

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
}





export const obtenerListadoDocentes = async (req, res) => {
    

    try {


        const {cuil} = req.query

        const consulta = {
            roles: {$nin: [roles.refEvaluador, roles.responsableProyecto, roles.comAsesora, roles.admin]},
            estado: estadoUsuario.activo
        }

        // Agregar el filtro de cuil si existe
        if (cuil) {
            consulta.cuil = { $regex: cuil, $options: 'i' };
        }

        const usuarios = await Usuario.find(consulta)
        .select('-password -tokenConfirm -estado -cuentaConfirmada -tokenRecuperacion -__v')
        .lean()
        .exec()

        if (usuarios.length == 0) {
            return res.status(204).json({ error: "No existen usuarios que cumplan las condiciones" });
        }

        const docentes = await Promise.all(
            usuarios.map(async (usuario) => {
              const docente = await Docente.findOne({usuario: usuario._id})
              .select('-__v -cuil -usuario')
              .lean()
              .exec();
      
              if(!docente){
                return {
                  ...usuario,
                }
              }
              return {
                ...usuario,
                datos_docente: docente,
              };
            })
          );

        
        return res.json({usuarios: docentes});
        
    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})

    }
    

}


export const obtenerProyectosAsignadosAReferente = async (req, res) => {
    try {
        const uid = req.uid;

        const usuario = await Usuario.findById(uid);
        if(!usuario){
            return res.status(401).json({ error: "No existe el usuario asociado a la sesión" });
        }

        const docente = await Docente.findOne({usuario: usuario._id});
        if(!docente){
            return res.status(401).json({ error: "No existe el docente asociado al usuario" });
        }

        const referente = await Referente.findOne({idDocente: docente._id});
        if(!referente){
            return res.status(401).json({ error: "No existe un referente seleccionado asociado al docente" });
        }

        const proyectos = await Proyecto.find({sede: referente.sede})  
        .select('-__v -id_carpeta_drive')
        .lean()
        .exec()
        
        if(proyectos.length == 0){
            return res.status(204).json({ error: "No existen proyectos asignados al referente de evaluador" });
        }

        return res.json({ proyectos });


    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Error de servidor"})
    }

}

// export const eliminarAsignaciónEvaluadorAProyecto = async (req, res) => {
//     try {

//         //const { id } = req.params;
//         const { evaluador } = req.body;

//         const errores = [];

//         const proyecto = req.proyecto;
//         if (!proyecto) {
//             return res.status(401).json({ error: "No existe el proyecto con el ID ingresado" });
//         }

//         if (proyecto.evaluadoresRegionales.length == 0) {
//             return res.status(401).json({ error: `El proyecto no tiene evaluadores asignados` });
//         }

//         const ev = await Evaluador.findById(evaluador);
//         if (!ev) {
//             return res.status(401).json({ error: "No existe el evaluador con el ID ingresado" });
//         }

//         proyecto.evaluadoresRegionales = proyecto.evaluadoresRegionales.filter(id => id.toString() !== evaluador.toString());
        
//         proyecto.save()

//         return res.json({ msg: `Se ha eliminado la asignación del evaluador ID ${ev._id} al proyecto '${proyecto.titulo}'` });

//     } catch (error) {
//         return res.status(500).json({ error: "Error de servidor" });
//     }
// }

export const asignarEvaluadoresAProyecto = async (req, res) => {
    try {

        const { evaluadores } = req.body;
        const errores = [];

        const proyecto = req.proyecto;
        if (!proyecto) {
            return res.status(401).json({ error: "No existe el proyecto con el ID ingresado" });
        }

        proyecto.evaluadoresRegionales = []

        // if (proyecto.evaluadoresRegionales.length >= 3) {
        //     return res.status(401).json({ error: `El proyecto ya tiene 3 evaluadores asignados` });
        // }

        // if (proyecto.evaluadoresRegionales.length + evaluadores.length > 3) {
        //     return res.status(401).json(
        //         { error: `No puedes asignar ${evaluadores.length} evaluadores, hay ${proyecto.evaluadoresRegionales.length} evaluadores asignados en el proyecto. Puedes asignar ${3 - proyecto.evaluadoresRegionales.length} como máximo` });
        // }

        for (const evaluadorID of evaluadores) {
            try {
                // if (proyecto.evaluadoresRegionales.includes(evaluadorID.toString())) {
                //     errores.push(`El evaluador con ID ${evaluadorID} ya ha sido asignado al proyecto`);
                // } else {
                    const evaluador = await Evaluador.findById(evaluadorID);
                    if (!evaluador) {
                        errores.push(`No existe un evaluador registrado con ID ${evaluadorID}`);
                    } else {
                        const proyectosAsignados = await Proyecto.find({ evaluadoresRegionales: evaluadorID, _id: { $ne: proyecto._id } }).countDocuments();
                        if (proyectosAsignados >= 5) {
                            errores.push(`Evaluador con ID ${evaluadorID} ya está asignado a 5 proyectos`);
                        } else if(evaluador.sede.toString() != proyecto.sede.toString()) {
                            errores.push(`Evaluador con ID ${evaluadorID} no pertenece a la sede del proyecto`);
                        } else if(evaluador.pendiente == true) {
                            errores.push(`Evaluador con ID ${evaluadorID} no se encuentra activo`);
                        }
                         else {
                            proyecto.evaluadoresRegionales.push(evaluadorID);
                        }
                    }
                // }
            } catch (error) {
                errores.push(`Error al procesar evaluador con ID ${evaluadorID}: ${error.message}`);
            }
        }

        if (errores.length > 0) {
            return res.status(401).json({ error: "Han ocurrido errores al asignar evaluadores al proyecto", errors: errores });
        } else {
            await proyecto.save();
            return res.json({ msg: `Todos los evaluadores han sido asignados correctamente al proyecto '${proyecto.titulo}'` });
        }

    } catch (error) {
        return res.status(500).json({ error: "Error de servidor" });
    }
}


export const obtenerEvaluadores = async (req, res) => {

    try {
        const {id} = req.params;
        const uid = req.uid;
        const feriaActiva = await getFeriaActivaFuncion();

        const proyecto = await Proyecto.findById(id);
        if(!proyecto){
            return res.status(401).json({ error: "No existe el proyecto con el ID ingresado" });
        }

        const usuario = await Usuario.findById(uid);
        if(!usuario){
            return res.status(401).json({ error: "No existe el usuario asociado a la sesión" });
        }

        const docente = await Docente.findOne({usuario: usuario._id});
        if(!docente){
            return res.status(401).json({ error: "No existe el docente asociado al usuario" });
        }

        const referente = await Referente.findOne({idDocente: docente._id});
        if(!referente){
            return res.status(401).json({ error: "No existe un referente seleccionado asociado al docente" });
        }

        const evaluadores = await Evaluador.find({feria: feriaActiva._id, sede: referente.sede, pendiente: false})
        .select('-__v -id_carpeta_cv -feria -pendiente')
        .lean()
        .exec()

        const evaluadoresDetalle = await Promise.all(
            evaluadores.map(async (evaluador) => {

                const docente = await Docente.findById(evaluador.idDocente)
                .select('-__v -_id -usuario')
                .lean()
                .exec()
                if(!docente){
                    return res.status(401).json({ error: "No existe el docente asociado al evaluador" });
                }
                
                const proyectosAsignados = await Proyecto.find({ evaluadoresRegionales: evaluador._id }).countDocuments();
                const cantidadMaximaAsignaciones = 5;

                return {
                    ...evaluador,
                    datos_docente: docente,
                    coincidencia: calcularCoincidencia(evaluador, proyecto),
                    proyectosAsignados,
                    cantidadMaximaAsignaciones
                }

            })
        )

        return res.json({ evaluadores: evaluadoresDetalle })

    } catch (error) {
        return res.status(500).json({error: "Error de servidor"})
    }
}



const calcularCoincidencia = (evaluador, proyecto) => {
    
    //console.log("NIVEL DE COINCIDENCIA -------------------- Evaluador: ", evaluador._id.toString())

    const MAX_PUNTUACION = 100; // Puntuación máxima

    // Puntuación inicial
    let puntuacionTotal = 0;

    // Comprobar coincidencia de nivel
    if (evaluador.niveles.toString().includes(proyecto.nivel.toString())) {
        puntuacionTotal += MAX_PUNTUACION / 4; // Asignar 25 puntos (25%)
        //console.log("NIVEL: ", MAX_PUNTUACION / 4)
    }


    // Comprobar coincidencia de categoría
    if (evaluador.categorias.toString().includes(proyecto.categoria.toString())) {
        puntuacionTotal += MAX_PUNTUACION / 4; // Asignar 25 puntos (25%)
        //console.log("CATEGORIA: ", MAX_PUNTUACION / 4)
    }

    // Comprobar antecedentes
    const antecedentes = evaluador.antecedentes || [];
    const antecedentesPuntaje = antecedentes.reduce((total, antecedente) => {
        // Asignar puntaje según el tipo de antecedente (referente, evaluador, responsable de proyecto)
        let puntajeAntecedente = 0;
        if (antecedente.rol === '1') {
        puntajeAntecedente = 10; // 10 puntos por ser "referente"
        } else if (antecedente.rol === '2') {
        puntajeAntecedente = 8; // 8 puntos por ser "evaluador"
        } else if (antecedente.rol === '3') {
        puntajeAntecedente = 2; // 2 puntos por ser "responsable de proyecto"
        }

        // Calcular el factor de influencia de los años más recientes
        const añosDesdeAntecedente = new Date().getFullYear() - parseInt(antecedente.year);
        const factorAños = Math.max(1, 15 - añosDesdeAntecedente); // Factor máximo de 10 años

        // Aplicar el puntaje del antecedente con el factor de influencia de los años
        return total + (puntajeAntecedente * factorAños);
    }, 0);

    // Función de decaimiento logarítmico
    const decaimientoLogaritmico = (x) => {
        return Math.pow(Math.log(1 + x), 1.7)
    };

    // Escala logarítmica y ajuste al rango 0-25 con decaimiento logarítmico
    const MAX_PUNTUACION_ANTECEDENTES = 25;
    const escalaLogaritmica = decaimientoLogaritmico(antecedentesPuntaje);
    puntuacionTotal += Math.min(escalaLogaritmica, MAX_PUNTUACION_ANTECEDENTES);

    //console.log("ANTECEDENTES: ", Math.min(escalaLogaritmica, MAX_PUNTUACION_ANTECEDENTES))

    // Comprobar coincidencia de sede
    if (evaluador.sede.toString() == proyecto.sede.toString()) {
        puntuacionTotal += MAX_PUNTUACION / 4; // Asignar 25 puntos (25%)
        //console.log("SEDE: ", MAX_PUNTUACION / 4)
    }

    
    //console.log("TOTAL: ", parseFloat(puntuacionTotal.toFixed(2)))
    
    return parseFloat(puntuacionTotal.toFixed(2));
}



export const obtenerInfoReferente = async (req, res) => {
    try {

        const uid = req.uid;
        const feriaActiva = await getFeriaActivaFuncion()

        const docente = await Docente.findOne({usuario: uid})
        if(!docente){
            return res.status(401).json({ error: "No existe un docente asociado a la sesión actual" });
        }

        const ref = await Referente.findOne({idDocente: docente._id})
        if(!ref){
            return res.status(401).json({ error: "No existe un referente asociado a la sesión actual" });
        }

        const cant_proyectos_sede = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id})
        const cant_proyectos_pendientes_asignacion = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id, evaluadoresRegionales: {$exists: false, $eq: []}});
        const cant_proyectos_por_evaluar_regional = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id, estado: estado.instanciaRegional});
        const cant_proyectos_por_evaluar_provincial = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id, estado: estado.promovidoProvincial});
        const cant_proyectos_por_confirmar_regional = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id, estado: estado.enEvaluacionRegional});
        const cant_proyectos_por_confirmar_provincial = await Proyecto.countDocuments({sede: ref.sede, feria: feriaActiva._id, estado: estado.enEvaluacionProvincial});


        let evaluadores_asignados = await Evaluador.find({pendiente: false, sede: ref.sede, feria: feriaActiva._id})
            .select('-__v -docente -sede -antecedentes -feria -fechaPostulacion -pendiente -id_carpeta_cv -CV -categorias -niveles')
            .lean()
            .exec()

        evaluadores_asignados = await Promise.all(evaluadores_asignados.map(async (evaluador) => {
            const docente = await Docente.findById(evaluador.idDocente)
                .select('-__v -_id -telefono -cargo -usuario -feria -fechaPostulacion -pendiente -id_carpeta_cv -CV')
                .lean()
                .exec()
            if(docente){
                return {
                    ...evaluador,
                    datos_docente: docente
                }
            }
            return evaluador;
        }))


        const {instancia_actual, prox_instancia} = obtenerFaseFeria(parseInt(feriaActiva.estado));
        const prox_fecha = convertirFecha(eval(`feriaActiva.${obtenerProximaFecha(parseInt(feriaActiva.estado))}`))

        let referente;
        if(parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaEscolar_Finalizada)) {
            referente = {
                cant_proyectos_sede,
                cant_proyectos_pendientes_asignacion,
                evaluadores: evaluadores_asignados,
                prox_instancia,
                instancia_actual,
                prox_fecha,
            }
        } else if (parseInt(feriaActiva.estado) <= parseInt(estadoFeria.instanciaRegional_ExposicionFinalizada)) {
            referente = {
                cant_proyectos_por_evaluar_regional,
                cant_proyectos_por_confirmar_regional,
                evaluadores: evaluadores_asignados,
                prox_instancia,
                instancia_actual,
                prox_fecha,
            }
        } else {
            referente = {
                cant_proyectos_por_evaluar_provincial,
                cant_proyectos_por_confirmar_provincial,
                evaluadores: evaluadores_asignados,
                prox_instancia,
                instancia_actual,
                prox_fecha,
            }
        }


        return res.json({referente})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Error de servidor"})
    }
}

export const obtenerFaseFeria = (estado) => {
    if (estado >= estadoFeria.creada && estado <= estadoFeria.iniciada) {
        return { instancia_actual: "Escolar", prox_instancia: "Regional" };
    } else if (estado === estadoFeria.instanciaEscolar) {
        return { instancia_actual: "Escolar", prox_instancia: "Regional" };
    } else if (estado >= estadoFeria.instanciaEscolar_Finalizada && estado <= estadoFeria.instanciaRegional_ExposicionFinalizada) {
        return { instancia_actual: "Regional", prox_instancia: "Provincial" };
    } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaProvincial && estado <= estadoFeria.instanciaProvincial_ExposicionFinalizada) {
        return { instancia_actual: "Provincial", prox_instancia: "Nacional" };
    } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaNacional && estado <= estadoFeria.finalizada) {
        return { instancia_actual: "Nacional", prox_instancia: " - " };
    } else {
        return { instancia_actual: " - ", prox_instancia: " - " };
    }
  };

export const obtenerProximaFecha = (estado) => {
    if (estado >= estadoFeria.creada && estado <= estadoFeria.iniciada) {
        return fechasFeria.fechaInicioEscolar;
    } else if (estado === estadoFeria.instanciaEscolar) {
        return fechasFeria.fechaFinEscolar;
    } else if (estado >= estadoFeria.instanciaEscolar_Finalizada && estado <= estadoFeria.instanciaRegional_ExposicionFinalizada) {
        return fechasFeria.fechaPromocionAProvincial;
    } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaProvincial && estado <= estadoFeria.instanciaProvincial_ExposicionFinalizada) {
        return fechasFeria.fechaPromocionANacional;
    } else if (estado >= estadoFeria.proyectosPromovidosA_instanciaNacional && estado <= estadoFeria.finalizada) {
        return fechasFeria.fechaFin;
    } else {
        return " - ";
    }
};


export const convertirFecha = (fecha) => {
    const fechaObjeto = new Date(fecha);
    const dia = String(fechaObjeto.getDate()).padStart(2, '0');
    const mes = String(fechaObjeto.getMonth() + 1).padStart(2, '0');
    const anio = fechaObjeto.getFullYear().toString().slice(2);
    return `${dia}/${mes}/${anio}`;
};