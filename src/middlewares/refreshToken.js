import { generateToken } from "../helpers/generateToken.js";

// Permite volver a obtener el Token a partir del Refresh Token ya verificado
export const refreshToken = (req, res) => {
    
    try {
        
        const {token, expiresIn} = generateToken(req.uid); //el req viene del middleware requireRefreshToken
        return res.json({token, expiresIn});

    } catch (error) {
        console.log(error)   
        return res.status(500).json({error: "Error de servidor"})
    }
}