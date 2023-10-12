import fs from 'fs';
import {Router} from 'express';
import { requireToken } from '../middlewares/requireToken.js';

const file = fs.readFileSync('src/9768409BDCD16F7607D59CC499BC0FC1.txt');

const routerValidator = Router();



routerValidator.get("/9768409BDCD16F7607D59CC499BC0FC1.txt" , (req , res) => {
    const fileContent = file.toString(); // Convierte el búfer a una cadena de texto
    res.send(fileContent); // Envía el contenido como respuesta
});


export default routerValidator;