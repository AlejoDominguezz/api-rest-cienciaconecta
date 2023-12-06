import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from '../middlewares/validar-roles.js';
import { roles } from '../helpers/roles.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors'

const routerArena = Router();

const proxyOptions = {
    target: 'http://localhost:4000',
    changeOrigin: true,
    timeout: 60000,
    pathRewrite: { '^/arena/': '/arena/' },
    onProxyRes: (proxyRes, req, res) => {
        // Configuración del encabezado CORS para permitir cualquier origen
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    },
    onProxyReq: (proxyReq, req, res) => {
    // Configuración adicional de encabezados para las solicitudes normales
    // Puedes agregar más encabezados según sea necesario
    proxyReq.setHeader('Some-Additional-Header', 'value');
    },
    onProxyReqOpt: (proxyReqOpt, req, res) => {
    // Configuración de encabezados para las solicitudes preflight OPTIONS
    proxyReqOpt.headers['Access-Control-Allow-Origin'] = '*';
    proxyReqOpt.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
    proxyReqOpt.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyReqOpt.headers['Some-Additional-Header'] = 'value';
    return proxyReqOpt;
    },
  };
  
  const arenaProxy = createProxyMiddleware(proxyOptions);
  
  routerArena.all('/*', 
  //requireToken, 
  //checkRolAuth([roles.admin, roles.comAsesora]), 
  async (req, res) => {
    try {
      await arenaProxy(req, res);
    } catch (error) {
      console.error('Error en el proxy:', error);
      res.status(500).send('Error interno del servidor');
    }
  });
  

export default routerArena;


