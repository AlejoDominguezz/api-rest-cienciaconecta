import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routerFerias from '../routes/feria.route.js';
import routerUsuarios from '../routes/usuario.route.js';
import routerAuth from '../routes/auth.route.js'
import routerProyectos from '../routes/proyecto.route.js';
import routerSedes from '../routes/sede.route.js';

import dbConnection from '../database/config.js';
import { crearCategorias, crearNiveles } from '../helpers/initialSetup.js';
import routerCategorias from '../routes/categoria.route.js';
import routerNiveles from '../routes/nivel.route.js';




class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
    
            feria:          '/api/v1/feria',
            usuario:        '/api/v1/usuario',
            auth:           '/api/v1/auth',
            proyecto:       '/api/v1/proyecto',
            sede:           '/api/v1/sede', 
            categoria:      '/api/v1/categoria',
            nivel:          '/api/v1/nivel'
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

        const whitelist = [process.env.ORIGIN1, ]

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
        crearCategorias();
        crearNiveles();
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
    }


    listen(){
        this.app.listen( this.port , () => {
            console.log('servidor corriendo en puerto' , process.env.PORT );
            console.log("🔥🔥🔥 http://localhost:5000") 
        });
    }


}


export default Server;