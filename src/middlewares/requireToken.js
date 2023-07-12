import jwt from 'jsonwebtoken';
import { tokenVerificationErrors } from '../helpers/generateToken.js';


// Verifica que el Token enviado es válido, para rutas protegidas
export const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization;
        if(!token) throw new Error('No Bearer')

        token = token.split(" ")[1]; //Separa palabra Bearer del token, toma el token solo
        const {uid} = jwt.verify(token, process.env.JWT_SECRET)

        req.uid = uid

        next()
    } catch (error) {
        console.log(error.message)

        return res.status(401).send({error: tokenVerificationErrors[error.message]})
    }
}


export const prueba = (req, res) => {
    res.json({ok: true})
}
