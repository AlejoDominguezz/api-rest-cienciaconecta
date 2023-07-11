import express from 'express';
import cors from 'cors';
import routerFerias from '../routes/ferias.js';
import routerUsuarios from '../routes/usuario.js';


import dbConnection from '../database/config.js';


class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
    
            feria:          '/api/v1/feria',
            usuario:        '/api/v1/usuario'

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



    }



    routes(){
        //path de feria con su ruta 
        this.app.use(this.paths.feria, routerFerias);

        //path de usuario para el CRUD del mismo
        this.app.use(this.paths.usuario, routerUsuarios);


    }


    listen(){
        this.app.listen( this.port , () => {
            console.log('servidor corriendo en puerto' , process.env.PORT );
            console.log("🔥🔥🔥 http://localhost:5000") 
        });
    }


}


export default Server;