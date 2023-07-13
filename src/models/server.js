import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routerFerias from '../routes/feria.route.js';
import routerUsuarios from '../routes/usuario.route.js';
import routerAuth from '../routes/auth.route.js'
import routerProyectos from '../routes/proyecto.route.js';

import dbConnection from '../database/config.js';



class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
    
            feria:          '/api/v1/feria',
            usuario:        '/api/v1/usuario',
            auth:           '/api/v1/auth',
            proyecto:       '/api/v1/proyecto',
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
        //cors
        this.app.use(cors())

        //parseo y lectura del body
        this.app.use(express.json());

        //Cookie-parser
        this.app.use(cookieParser())

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
    }


    listen(){
        this.app.listen( this.port , () => {
            console.log('servidor corriendo en puerto' , process.env.PORT );
            console.log("🔥🔥🔥 http://localhost:5000") 
        });
    }


}


export default Server;