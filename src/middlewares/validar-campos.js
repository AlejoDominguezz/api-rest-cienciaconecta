import { validationResult } from "express-validator";

export const validarCampos = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: "Oops! Hubo un error al validar los campos. ¡Intentá de nuevo más tarde!", errors: errors.array() });
  }

  next();
};
