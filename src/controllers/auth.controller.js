import { Usuario } from "../models/Usuario.js";
import {
  generateToken,
  generateRefreshToken,
} from "../helpers/generateToken.js";
import { existeCuil, existeEmail } from "../helpers/db-validar.js";
import { Docente } from "../models/Docente.js";

// Función de Login
export const login = async (req, res) => {
  const { cuil, password } = req.body;

  try {
    // Buscamos usuario por mail
    let user = await Usuario.findOne({ cuil });
    if (!user)
      return res.status(403).json({ error: "No existe el usuario registrado" });
    if (user.estado === '2')
      return res.status(403).json({ error: "Usuario pendiente de activación. Se le notificará por email cuando el usuario haya sido activado"});
    if (user.estado === '0')
      return res.status(403).json({ error: "Usuario inactivo" });

    // Comparo contraseña ingresada con el hash
    const resPassword = await user.comparePassword(password);
    if (!resPassword)
      return res.status(403).json({ error: "Datos incorrectos" });

    // Generar Token con JWT
    const { token, expiresIn } = generateToken(user.id, user.cuil, user.roles);

    // Genero Refresh Token
    generateRefreshToken(user.id, user.cuil, user.roles, res);

    const roles = user.roles;
    const userCuil = user.cuil;
    const id = user._id;

    return res.json({ token, expiresIn, id, userCuil, roles });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

//Función de Registro
export const register = async (req, res) => {
  const { nombre, apellido, cuil, email, password, dni, cue, telefono, cargo } =
    req.body;
  const estado = '2';

  try {
    // Busco usuario por mail
    //existeCuil(cuil);

    const user = new Usuario({ cuil, email, estado, password });
    const docente = new Docente({
      nombre,
      apellido,
      cuil,
      dni,
      cue,
      telefono,
      cargo,
      usuario: user._id,
    });
    //console.log(user.nombre, user.apellido, user.estado, user.cuil, user.email, user.password, user.dni, user.cue)

    await user.save();
    await docente.save();

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({ error: "Ya existe este usuario" });
    }
    return res.status(500).json({ error: "Error de servidor" });
  }
};

// Función de deslogueo
export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ ok: true });
};
