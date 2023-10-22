import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import {swaggerDocs} from '../swagger.js';
import routerFerias from '../routes/feria.route.js';
import routerUsuarios from '../routes/usuario.route.js';
import routerAuth from '../routes/auth.route.js'
import routerProyectos from '../routes/proyecto.route.js';
import routerSedes from '../routes/sede.route.js';

import dbConnection from '../database/config.js';
import { crearCategorias, crearEstablecimientosEducativos, crearNiveles } from '../helpers/initialSetup.js';
import routerCategorias from '../routes/categoria.route.js';
import routerNiveles from '../routes/nivel.route.js';
import routerDepartamentos from '../routes/departamento.route.js';
import routerLocalidades from '../routes/localidad.route.js';
import routerEstablecimiento from '../routes/establecimiento.route.js';
import routerEvaluadores from '../routes/evaluador.route.js';
import routerEvaluacion from '../routes/evaluacion.route.js';
import routerReferente from '../routes/referente.route.js';
import routerExposicion from '../routes/exposicion.route.js';
import routerPromocion from '../routes/promocion.route.js';
import routerExposicion_Provincial from '../routes/exposicion_provincial.route.js';






class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
    
            feria:                  '/api/v1/feria',
            usuario:                '/api/v1/usuario',
            auth:                   '/api/v1/auth',
            proyecto:               '/api/v1/proyecto',
            sede:                   '/api/v1/sede', 
            categoria:              '/api/v1/categoria',
            nivel:                  '/api/v1/nivel',
            departamento:           '/api/v1/departamento',
            localidad:              '/api/v1/localidad',
            establecimiento:        '/api/v1/establecimiento',
            evaluador:              '/api/v1/evaluador',
            evaluacion:             '/api/v1/evaluacion',
            exposicion:             '/api/v1/exposicion',
            referente:              '/api/v1/referente',
            promocion:              '/api/v1/promocion',
            exposicion_provincial:  '/api/v1/exposicion-provincial',
        }

        

        //conectar a base de datos
        this.conectarDB();

        //Middlewares funcion que siempre ejecuta cuando levntamos el servidor, añadiendo funcinaliddades
        this.middlewares();

        //rutas app...
        this.routes();


    }

    async conectarDB(){
        await dbConnection();
    }


    middlewares(){
        //CORS
        this.app.use(function (req, res, next) {
            req.headers.origin = req.headers.origin || 'http://' + req.headers.host;
            next();
          });
        //test cors
        const whitelist = [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3 , process.env.ORIGIN4 ]

        this.app.use(cors(
             {
             origin: function(origin, callback){
                 if(whitelist.includes(origin)){
                     return callback(null, origin) 
                 }
                 return callback("Error de CORS - Origin: " + origin + " No autorizado")
             },
             credentials: true  
             }
        ))

        //parseo y lectura del body
        this.app.use(express.json());

        //Cookie-parser
        this.app.use(cookieParser())

        //Inicialización de categorias y niveles
        //crearCategorias();
        //crearNiveles();
        //crearEstablecimientosEducativos();
    }



    routes(){
        //path de feria con su ruta 
        this.app.use(this.paths.feria, routerFerias);

        //path de usuario para el CRUD del mismo
        this.app.use(this.paths.usuario, routerUsuarios);

        //path de autenticación para login y register
        this.app.use(this.paths.auth, routerAuth);

        //path de gestion de proyectos
        this.app.use(this.paths.proyecto, routerProyectos);

        //path de gestion de sedes
        this.app.use(this.paths.sede, routerSedes);

        //path de categorias de proyectos
        this.app.use(this.paths.categoria, routerCategorias);

        //path de niveles de proyectos
        this.app.use(this.paths.nivel, routerNiveles);

        //path de departamentos
        this.app.use(this.paths.departamento, routerDepartamentos);

        //path de localidades
        this.app.use(this.paths.localidad, routerLocalidades);

        //path de establecimientos educativos
        this.app.use(this.paths.establecimiento, routerEstablecimiento);

        //path de evaluadores
        this.app.use(this.paths.evaluador, routerEvaluadores);

        //path de evaluaciones
        this.app.use(this.paths.evaluacion, routerEvaluacion);

        //path de exposiciones
        this.app.use(this.paths.exposicion, routerExposicion);

        //path de referentes
        this.app.use(this.paths.referente, routerReferente);

         //path de promoción de proyectos
         this.app.use(this.paths.promocion, routerPromocion);

         //path de exposiciones
        this.app.use(this.paths.exposicion_provincial, routerExposicion_Provincial);
    }


    listen(){
        this.app.listen( this.port , () => {
            console.log('servidor corriendo en puerto' , process.env.PORT );
            console.log(`Servidor corriendo en: ${process.env.ORIGIN1}` );
            swaggerDocs(this.app, process.env.PORT);
        });
    }


}


export default Server;
