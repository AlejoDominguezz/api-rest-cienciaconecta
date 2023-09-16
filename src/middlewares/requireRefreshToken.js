import { tokenVerificationErrors } from "../helpers/generateToken.js";
import jwt from "jsonwebtoken";

// Verifica que se tenga el Refresh Token para volver a obtener (refrescar) el Token
export const requireRefreshToken = (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) throw new Error("No existe el token");

    const { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
    req.uid = uid;

    next();
  } catch (error) {
    res.status(401).json({ error: tokenVerificationErrors[error.message] });
  }
};
