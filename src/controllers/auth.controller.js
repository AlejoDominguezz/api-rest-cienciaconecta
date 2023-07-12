import { Usuario } from "../models/Usuario.js";
import { generateToken, generateRefreshToken } from "../helpers/generateToken.js";
import { existeEmail } from "../helpers/db-validar.js";

// Función de Login
export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Buscamos usuario por mail
        let user = await Usuario.findOne({email});
        if(!user) 
            return res.status(403).json({error: "No existe el usuario registrado"});

        // Comparo contraseña ingresada con el hash
        const resPassword = await user.comparePassword(password);
        if(!resPassword)
            return res.status(403).json({error: "Contraseña incorrecta"});
        

        // Generar Token con JWT
        const {token, expiresIn} = generateToken(user.id)

        // Genero Refresh Token

        generateRefreshToken(user.id, res);

        return res.json({token, expiresIn})

    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Error de servidor"});
    }
}


//Función de Registro
export const register = async (req, res) => {
    
    const {nombre, apellido, cuil, email, password, dni} = req.body;
    const estado = true;

    try {

        // Busco usuario por mail
        existeEmail(email);
        
        const user = new Usuario({nombre, apellido, estado, cuil, email, password, dni})
        console.log(user.nombre, user.apellido, user.estado, user.cuil, user.email, user.password, user.dni)
        
        await user.save()

        // Generar el Token con JWT
        const {token, expiresIn} = generateToken(user.id);
        // Generar el RefreshToken con JWT
        generateRefreshToken(user.id, res);

        return res.status(201).json({token, expiresIn})


    } catch (error) {

        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({error: "Ya existe este usuario"});
        }
        return res.status(500).json({error: "Error de servidor"})
    }
};


// Función de deslogueo
export const logout = (req, res) => {
    res.clearCookie('refreshToken')
    res.json({ok: true})
}
