import { generateToken } from "../helpers/generateToken.js";
import { infoFeria } from "../helpers/infoFeria.js";
import { Usuario } from "../models/Usuario.js";

// Permite volver a obtener el Token a partir del Refresh Token ya verificado
export const refreshToken = async (req, res) => {
  try {
    const user = await Usuario.findById(req.uid)
    const roles = user.roles;
    const cuil = user.cuil;
    const id = user.id

    const { token, expiresIn } = generateToken(id); //el req viene del middleware requireRefreshToken

    const feria = await infoFeria()

    return res.json({ token, expiresIn, id, cuil, roles, feria});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};
