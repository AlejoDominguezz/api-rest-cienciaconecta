import jwt from "jsonwebtoken";
import { tokenVerificationErrors } from "../helpers/generateToken.js";
import { Usuario } from "../models/Usuario.js";

// Verifica que el Token enviado es válido, para rutas protegidas
export const requireToken = async (req, res, next) => {
  try {
    let token = req.headers?.authorization;
    if (!token) throw new Error("No Token");

    token = token.split(" ")[1]; //Separa palabra Bearer del token, toma el token solo
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Usuario.findById(uid)

    req.uid = uid;
    req.roles = user.roles;
    const baja = user.estado;

    if(baja === '0')
      return res.status(403).json({error: "El usuario ha sido dado de baja"})

    next();
  } catch (error) {
    console.log(error.message);

    return res
      .status(401)
      .send({ error: tokenVerificationErrors[error.message] });
  }
};
