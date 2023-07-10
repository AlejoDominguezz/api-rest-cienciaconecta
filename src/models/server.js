const express = require('express');
const cors = require('cors');

const { dbConnection } = require('../database/config');


class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
    
            feria:          '/api/feria',
            usuario:        '/api/usuario'

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
        this.app.use(this.paths.feria, require('../routes/ferias'));

        //path de usuario para el CRUD del mismo
        this.app.use(this.paths.usuario, require('../routes/usuario'));


    }


    listen(){
        this.app.listen( this.port , () => {
            console.log('servidor corriendo en puerto' , process.env.PORT);
        });
    }


}


module.exports= Server;