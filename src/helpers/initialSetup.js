import { Nivel } from "../models/Nivel.js"
import { Categoria } from "../models/Categoria.js"
import xlsx  from 'xlsx';
import { EstablecimientoEducativo } from "../models/EstablecimientoEducativo.js";

export const crearNiveles = async () => {
    try {
        const count = await Nivel.estimatedDocumentCount();

        if(count > 0) return;

        const values = await Promise.all([
            new Nivel({nombre: "Nivel Inicial", abreviatura: "Nivel I", codigo: '1'}).save(),
            new Nivel({nombre: "Primer Ciclo de la Educación Primaria", abreviatura: "Nivel IIA", codigo: '2'}).save(),
            new Nivel({nombre: "Segundo Ciclo de la Educación Primaria", abreviatura: "Nivel IIB", codigo: '3'}).save(),
            new Nivel({nombre: "Ciclo Básico de la Educación Secundaria", abreviatura: "Nivel IIIA", codigo: '4'}).save(),
            new Nivel({nombre: "Ciclo Orientado de la Educación Secundaria", abreviatura: "Nivel IIIB", codigo: '5'}).save(),
            new Nivel({nombre: "Nivel Superior Formación Docente", abreviatura: "Nivel IVA", codigo: '6'}).save(),
            new Nivel({nombre: "Nivel Superior Tecnicaturas", abreviatura: "Nivel IVB", codigo: '7'}).save(),
        ]);
        console.log(values);
    } catch (error) {
        console.error(error);   
    }
};

export const crearCategorias = async () => {
    try {
        const count = await Categoria.estimatedDocumentCount();

        if(count > 0) return;

        const values = await Promise.all([
            new Categoria({nombre: "Ciencias Naturales"}).save(),
            new Categoria({nombre: "Ciencias Sociales y humanas"}).save(),
            new Categoria({nombre: "Lengua y Literatura"}).save(),
            new Categoria({nombre: "Matemática"}).save(),
            new Categoria({nombre: "Lenguajes Artísticos"}).save(),
            new Categoria({nombre: "Educación Ambiental"}).save(),
            new Categoria({nombre: "Educación Tecnológica"}).save(),
            new Categoria({nombre: "Programación y Robótica"}).save(),
            new Categoria({nombre: "Emprendedurismo Escolar"}).save(),
            new Categoria({nombre: "Formación Ética y Ciudadana"}).save(),
            new Categoria({nombre: "Educación Física"}).save(),
            new Categoria({nombre: "Trabajos sobre temáticas de la enseñanza y aprendizaje propios de la formación docente y de las Tecnicaturas Profesionales"}).save(),
            new Categoria({nombre: "Proyectos multidisciplinares"}).save(),
        ]);
        console.log(values);
    } catch (error) {
        console.error(error);   
    }
};


export const crearEstablecimientosEducativos = async () => {
      try {
        const count = await EstablecimientoEducativo.estimatedDocumentCount();
        if(count > 0) return;

        const workbook = xlsx.readFile('./excel/2023.07.03_establecimientosEducativos.xlsx');
        const worksheet = workbook.Sheets['padron'];
    
        // Convertir el contenido del archivo Excel a un arreglo de objetos
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, range: 14 });

        // Filtrar las filas cuya provincia es "Córdoba"
        const dataCordoba = data.filter(row => row[0] === 'Córdoba');

        // Mapear los nombres de las columnas del Excel a los atributos del schema
        const mappedData = dataCordoba.map(row => {
            const dataObject = {};
        
            // Columna I - nombre
            dataObject['nombre'] = row[8];
        
            // Columna H - cue
            const cueFromExcel = row[7];
            const cue = cueFromExcel.substr(2); // Quitar los dos primeros números
            dataObject['cue'] = cue;
        
            // Columna A - provincia
            dataObject['provincia'] = row[0];
        
            // Columna D - departamento
            dataObject['departamento'] = row[3];
        
            // Columna F - localidad
            dataObject['localidad'] = row[5];
        
            // Columna J - domicilio
            dataObject['domicilio'] = row[9];
        
            // Columna K - CP
            dataObject['CP'] = row[10];
        
            // Columna L - telefono
            dataObject['telefono'] = row[11];
        
            // Columna M - email
            dataObject['email'] = row[12];
        
            // Atributos niveles
            dataObject['niveles'] = {
                // Columna X - niveles.inicial
                inicial: parseInt(row[23]) === 1 || parseInt(row[24]) === 1 || parseInt(row[16]) === 1 || parseInt(row[17]) === 1,

                // Columna S, Z, AC - niveles.primario
                primario: parseInt(row[18]) === 1 || parseInt(row[25]) === 1 || parseInt(row[28]) === 1,

                // Columna T, AA, AD - niveles.secundario
                secundario: parseInt(row[19]) === 1 || parseInt(row[26]) === 1 || parseInt(row[29]) === 1,

                // Columna V, W - niveles.terciario
                terciario: parseInt(row[21]) === 1 || parseInt(row[22]) === 1,
            };

        
            return dataObject;
        });

    
        // Dividir los datos en lotes más pequeños
        const batchSize = 100; // Tamaño del lote
        let totalSaved = 0; // Contador de documentos almacenados

        for (let i = 0; i < mappedData.length; i += batchSize) {
            const batch = mappedData.slice(i, i + batchSize);
            const result = await EstablecimientoEducativo.insertMany(batch);
            totalSaved += result.length;
        }
  
        console.log(`Se han guardado ${totalSaved} documentos en la base de datos.`);
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
      };

}

