import { Router } from 'express';
import { requireToken } from '../middlewares/requireToken.js';
import { checkRolAuth } from '../middlewares/validar-roles.js';
import { roles } from '../helpers/roles.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const routerArena = Router();

routerArena.get('/*', 
                //requireToken, 
                //checkRolAuth([roles.admin]), 
                createProxyMiddleware({
                    target: 'http://localhost:4000', 
                    changeOrigin: true,
                    pathRewrite: { '^/arena/': '/arena/' }, 
                }));


routerArena.post('/*', 
//requireToken, 
//checkRolAuth([roles.admin]), 
createProxyMiddleware({
    target: 'http://localhost:4000', 
    changeOrigin: true,
    pathRewrite: { '^/arena/': '/arena/' }, 
}));

routerArena.patch('/*', 
//requireToken, 
//checkRolAuth([roles.admin]), 
createProxyMiddleware({
    target: 'http://localhost:4000', 
    changeOrigin: true,
    pathRewrite: { '^/arena/': '/arena/' }, 
}));

routerArena.put('/*', 
//requireToken, 
//checkRolAuth([roles.admin]), 
createProxyMiddleware({
    target: 'http://localhost:4000', 
    changeOrigin: true,
    pathRewrite: { '^/arena/': '/arena/' }, 
}));

routerArena.delete('/*', 
//requireToken, 
//checkRolAuth([roles.admin]), 
createProxyMiddleware({
    target: 'http://localhost:4000', 
    changeOrigin: true,
    pathRewrite: { '^/arena/': '/arena/' }, 
}));


export default routerArena;


