import swaggerJSDoc from "swagger-jsdoc";
import SwaggerUI from "swagger-ui-express";

const options = {
    definition : {
        openapi: "3.0.0",
        info: {
            title: "CienciaConecta API REST",
            version: "1.0.0"
        }
    },
    apis: [ "src/routes/*.js",
            "src/models/*.js",
    ]

}

// Docs en JSON format
const swaggerSpec = swaggerJSDoc(options)

// Funcion para configurar nuestros Docs
export const swaggerDocs = (app, port) => {
    app.use("/api/docs", SwaggerUI.serve, SwaggerUI.setup(swaggerSpec));
    app.get("/api/docs.json", (req, res) => {
        res.setHeader('Content-Type', 'application/json');
    });

    console.log(`📖 Version 1 Docs are available at http://localhost:${port}/api/docs`)
}