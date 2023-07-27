import { Usuario } from "../models/Usuario.js";
import {
  generateToken,
  generateRefreshToken,
} from "../helpers/generateToken.js";
import { existeCuil, existeEmail } from "../helpers/db-validar.js";
import { Docente } from "../models/Docente.js";
import { transporter } from "../helpers/mailer.js";
import {nanoid} from 'nanoid';

// Función de Login
export const login = async (req, res) => {
  const { cuil, password } = req.body;

  try {
    // Buscamos usuario por mail
    let user = await Usuario.findOne({ cuil });
    if (!user)
      return res.status(403).json({ error: "No existe el usuario registrado" });
    if (!user.cuentaConfirmada)
      return res.status(403).json({ error: "Debe confirmar la cuenta antes de poder iniciar sesión" });
    if (user.estado === '2')
      return res.status(403).json({ error: "Usuario pendiente de activación. Se le notificará por email cuando el usuario haya sido activado"});
    if (user.estado === '0')
      return res.status(403).json({ error: "Usuario inactivo" });

    // Comparo contraseña ingresada con el hash
    const resPassword = await user.comparePassword(password);
    if (!resPassword)
      return res.status(403).json({ error: "Datos incorrectos" });


    const roles = user.roles;
    const userCuil = user.cuil;
    const id = user._id;  
    // Generar Token con JWT
    const { token, expiresIn } = generateToken(id);

    // Genero Refresh Token
    generateRefreshToken(id, res);

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

    const user = new Usuario({ cuil, email, estado, password, tokenConfirm: nanoid() });
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

    // Lógica de envío de mail de confirmación
    await transporter.sendMail({
      from: 'Ciencia Conecta',
      to: user.email,
      subject: "Verifica tu cuenta de correo",
      html: `<a href="http://localhost:5000/api/v1/auth/confirmar/${user.tokenConfirm}"> Verifica tu cuenta aquí </a>`
    })

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

// Función para confirmar cuenta de correo electrónico
export const confirmarCuenta = async (req, res) => {
  const {token} = req.params;

  try {
    const user = await Usuario.findOne({tokenConfirm: token});
    if(!user) throw new Error("Token de confirmación inválido")

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;

    await user.save();

    return res.status(200).json({ error: "Cuenta verificada, le llegará un email cuando su cuenta haya sido aprobada" });

  } catch (error) {
    return res.status(500).json({ error: "Error de servidor" });
  }
}