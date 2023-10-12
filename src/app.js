import 'dotenv/config';
import Server from './models/server.js';
import https from 'https';
import http from 'http';
import fs from 'fs';

const server = new Server();

if (process.env.MODO === 'production') {
    // Lee el certificado y la clave privada para HTTPS
    const privateKey = fs.readFileSync('src/private.key', 'utf8');
    const certificate = fs.readFileSync('src/certificate.crt', 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    // Crea un servidor HTTPS con los certificados
    const httpsServer = https.createServer(credentials, server.app);

    httpsServer.listen();
} else {
    // En desarrollo, utiliza HTTP en el puerto 80
    const httpServer = http.createServer(server.app);
    httpServer.listen();
}

server.listen();