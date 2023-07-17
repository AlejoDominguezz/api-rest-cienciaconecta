import { Nivel } from "../models/Nivel.js"
import { Categoria } from "../models/Categoria.js"

export const crearNiveles = async () => {
    try {
        const count = await Nivel.estimatedDocumentCount();

        if(count > 0) return;

        const values = await Promise.all([
            new Nivel({nombre: "Nivel Inicial", abreviatura: "Nivel I"}).save(),
            new Nivel({nombre: "Primer Ciclo de la Educación Primaria", abreviatura: "Nivel IIA"}).save(),
            new Nivel({nombre: "Segundo Ciclo de la Educación Primaria", abreviatura: "Nivel IIB"}).save(),
            new Nivel({nombre: "Ciclo Básico de la Educación Secundaria", abreviatura: "Nivel IIIA"}).save(),
            new Nivel({nombre: "Ciclo Orientado de la Educación Secundaria", abreviatura: "Nivel IIIB"}).save(),
            new Nivel({nombre: "Nivel Superior Formación Docente", abreviatura: "Nivel IVA"}).save(),
            new Nivel({nombre: "Nivel Superior Tecnicaturas", abreviatura: "Nivel IVB"}).save(),
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




