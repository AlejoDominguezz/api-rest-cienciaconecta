import jwt from 'jsonwebtoken';

// Función que genera el token
export const generateToken = (uid) => {
    const expiresIn = 60 * 15 //60seg x 15 = 15 min

    try {
        const token = jwt.sign({uid}, process.env.JWT_SECRET, {expiresIn});
        return {token, expiresIn};
    } catch (error) {
        console.log(error)
    }

}

// Función que genera el refresh token
export const generateRefreshToken = (uid, res) => {
    const expiresIn = 60 * 60 * 24 * 30 // 30 dias - No hace falta que sea tan corto como el token

    try {
        const refreshToken = jwt.sign({uid}, process.env.JWT_REFRESH, {expiresIn});
        
        // Guardamos el Refresh Token en cookie segura
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: !(process.env.MODO === "developer"),
            expires: new Date(Date.now() + expiresIn  * 1000) //*1000 porque está en milisegundos
        })

    } catch (error) {
        console.log(error)
    }

}



export const tokenVerificationErrors = {
    "invalid signature": "La firma del JWT no es válida",
    "jwt expired": "JWT expirado",
    "invalid token": "Token no válido",
    "No Bearer": "Utiliza formato Bearer",
    "jwt malformed": "JWT formato no válido"
};