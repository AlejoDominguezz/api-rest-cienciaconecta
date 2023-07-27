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
      html: `
      
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verifica tu cuenta de correo</title>
        <style>
          .outer-container {
            margin-top: 40px; 
            padding-top: 40px;
            padding-bottom: 40px;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
            position: relative;
          }

          .shadow {
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.1);
            z-index: -1;
          }
          .black-text {
            color: #000000; /* Color negro (#000000) */
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f0f0f0;">
        <div class="outer-container">
          <div class="shadow">
            <div class="container">
              <h2 style="color: #00ACE6;">¡Bienvenido a Ciencia Conecta!</h2>
              <p class="black-text" style="font-size: 16px;">Estamos emocionados de tenerte como parte de nuestra comunidad</p>
              <p class="black-text" style="font-size: 16px;">Haz clic en el siguiente botón para verificar tu cuenta:</p>
              <a href="http://localhost:5000/api/v1/auth/confirmar/${user.tokenConfirm}" style="display: inline-block; background-color: #00ACE6; color: #fff; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;">Verificar cuenta</a>
              <p style="font-size: 14px; color: #888; margin-top: 20px;">Si tienes problemas con el botón de verificación, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
              <p style="font-size: 14px; color: #888;"><a href="http://localhost:5000/api/v1/auth/confirmar/${user.tokenConfirm}" style="color: #00ACE6; text-decoration: none;">http://localhost:5000/api/v1/auth/confirmar/${user.tokenConfirm}</a></p>
              <img src="https://i.imgur.com/Cp5FCdR.jpg" alt="Marca de agua" style="position: absolute; bottom: 20px; right: 20px; max-width: 150px;">
            </div>
          </div>
        </div>
      </body>
      </html>
      
      `
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