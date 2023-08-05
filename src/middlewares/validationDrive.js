import { validarCampos } from "./validar-campos.js";
import { check } from "express-validator";
import { existeIdProyecto } from "../helpers/db-validar.js";
import multer from "multer";
const upload = multer();
import mime from "mime-types";

export const BodyValidationDrive = [
  check(
    "id",
    "No es un ID valido de mongo, verificar el id ingresado por parametro"
  ).isMongoId(),
  check("id").custom(existeIdProyecto),
  validarCampos,
];

export const validarExistArchivos = (req, res, next) => {
  // Verificar si los tres archivos están presentes en el form-data
  // const requiredFiles = ['carpetaCampo', 'informeTrabajo', 'registroPedagogicopdf'];
  // const missingFiles = [];
  
  // for (const fieldName of requiredFiles) {
  //   if (!req.files || !req.files.fieldname[fieldName]) {
  //     missingFiles.push(fieldName);
  //   } 
  // }
  // console.log(missingFiles);
  // if (missingFiles.length > 0) {
  //   return res.status(400).json({ error: `Faltan los siguientes archivos requeridos: ${missingFiles.join(', ')}` });
  // }
  console.log(req.files.carpetaCampo)
  next();
};

export const validarArchivosPDF = (req, res, next) => {
  // Verificar si los archivos son de tipo PDF
  const archivos = Object.values(req.files);
  console.log(archivos[0].mimetype);
  const extensionValida = "application/pdf";
  const archivosNoPDF = [];
  
  for (const archivo of archivos) {
    if (archivo.mimetype !== extensionValida) {
      console.log(archivo.mimetype)
      archivosNoPDF.push(archivo);
    }
  }
  console.log(archivosNoPDF);

  if (archivosNoPDF.length > 0) {
    const nombresNoPDF = archivosNoPDF.map(
      (archivo) => archivo.originalname
    );
    return res.status(400).json({
      error: "Los archivos deben ser archivos PDF.",
      info: `Los siguientes archivos no son PDFs: ${nombresNoPDF.join(", ")}.`,
    });
  }
  next();
};
