import { validarCampos } from "./validar-campos.js";
import { check } from "express-validator";
import { existeIdProyecto } from "../helpers/db-validar.js";
import multer from "multer";
const upload = multer();
import mime from "mime-types";
import formidable from "formidable";

export const BodyValidationDrive = [
  check(
    "id",
    "No es un ID valido de mongo, verificar el id ingresado por parametro"
  ).isMongoId(),
  check("id").custom(existeIdProyecto),
  validarCampos,
];

export const validarArchivosPDF = (req, res, next) => {

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al form-data", err.message);
      res.status(500).send("Error al procesar el form-data");
      return;
    }
    if(!files){
      return res.status(400).json({
        msg: "Error, debe ingresar los archivos pdfs! no ha ingresado nada!"
      })
    }
    const extensionValida = "application/pdf";
    const archivosNoPDF = [];
    const requiredFiles = ['carpetaCampo', 'registroPedagogicopdf', 'informeTrabajo'];


    const archivos_input = files;
    // Obtener los nombres de los archivos subidos
    const nombresArchivos = Object.keys(archivos_input);
    
    for (const fieldName of requiredFiles) {
      if (!nombresArchivos.includes(fieldName)) {
        res.status(400).json({msg: `Falta el archivo con el nombre: ${fieldName} , ingresarlo!`});
        return;
      }

      const archivo = archivos_input[fieldName];
      if (archivo.mimetype !== extensionValida) {
        archivosNoPDF.push(fieldName);
      }
    }
    // // Verificar si se subió un archivo con el campo "archivoPDF"
    if(archivosNoPDF.length>0){
      return res.status(400).json({
        msg: `Los archivos ingresados tienen que tener formato pdf!! revisar: ${archivosNoPDF}`
      })
    }

    // Si llegamos hasta aquí, el archivo es un PDF válido
    next();
  });
};
