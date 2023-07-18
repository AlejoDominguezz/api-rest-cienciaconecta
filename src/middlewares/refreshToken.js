import { generateToken } from "../helpers/generateToken.js";
import { Usuario } from "../models/Usuario.js";

// Permite volver a obtener el Token a partir del Refresh Token ya verificado
export const refreshToken = async (req, res) => {
  try {
    const { token, expiresIn } = generateToken(req.uid, req.cuil, req.roles); //el req viene del middleware requireRefreshToken

    const roles = req.roles;
    const cuil = req.cuil;
    const id = req.uid;

    return res.json({ token, expiresIn, id, cuil, roles});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};
