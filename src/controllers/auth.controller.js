import { Usuario } from "../models/Usuario.js";
import {
  generateToken,
  generateRefreshToken,
} from "../helpers/generateToken.js";
import { existeCuil, existeEmail } from "../helpers/db-validar.js";
import { Docente } from "../models/Docente.js";
import { transporter } from "../helpers/mailer.js";
import { nanoid } from 'nanoid';
import { confirmationMailHtml } from "../helpers/confirmationMail.js";
import { recoveryMailHtml } from "../helpers/recoveryMail.js";
import { estadoUsuario } from "../models/Usuario.js";
import { altaMailHtml } from "../helpers/altaMail.js";
import { emailCola } from "../helpers/queueManager.js";

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
    if (user.estado === estadoUsuario.pendiente)
      return res.status(403).json({ error: "Usuario pendiente de activación. Se le notificará por email cuando el usuario haya sido activado"});
    if (user.estado === estadoUsuario.inactivo)
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
    const refreshExpiresIn = generateRefreshToken(id, res);

    return res.json({ token, expiresIn, id, userCuil, roles, refreshExpiresIn });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};

//Función de Registro
export const register = async (req, res) => {
  const { nombre, apellido, cuil, email, password, telefono, cargo } =
    req.body;
  const estado = estadoUsuario.pendiente;

  try {

    const user = new Usuario({ cuil, email, estado, password, tokenConfirm: nanoid() });
    const docente = new Docente({
      nombre,
      apellido,
      cuil,
      //dni,
      //cue,
      telefono,
      cargo,
      usuario: user._id,
    });
    //console.log(user.nombre, user.apellido, user.estado, user.cuil, user.email, user.password, user.dni, user.cue)

    await user.save();
    await docente.save();

    await emailCola.add("email:confirmacionUsuario", { 
      tokenConfirm: user.tokenConfirm, 
      mail: user.email})

    // Lógica de envío de mail de confirmación
    // const confirmationMail = confirmationMailHtml(user.tokenConfirm)

    // await transporter.sendMail({
    //   from: 'Ciencia Conecta',
    //   to: user.email,
    //   subject: "Verifica tu cuenta de correo",
    //   html: confirmationMail
    // })

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

    return res.status(200).json({ msg: "Cuenta verificada, le llegará un email cuando su cuenta haya sido aprobada" });

  } catch (error) {
    return res.status(500).json({ error: "Error de servidor" });
  }
}

export async function solicitarRecuperacionContrasena(req, res) {
  const { cuil } = req.body;

  try {
    // Generar el token de recuperación
    const { token, expiresIn } = generateToken(cuil);

    // Actualizar el usuario en la base de datos con el token de recuperación
    const usuario = await Usuario.findOneAndUpdate(
      { cuil },
      { tokenRecuperacion: token },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await emailCola.add("email:recuperacionContrasena", { 
      token, 
      usuario})

    // // Lógica de envío de correo de recuperación
    // const recoveryMail = recoveryMailHtml(token); 

    // await transporter.sendMail({
    //   from: 'Ciencia Conecta',
    //   to: usuario.email,
    //   subject: "Recuperación de contraseña",
    //   html: recoveryMail
    // });

    const maskedEmail = usuario.email.replace(/^(.{4})(.*)(@.+)/, (_, p1, p2, p3) => `${p1}${'*'.repeat(p2.length)}${p3}`);
    const responseMessage = `Correo de recuperación enviado al mail ${maskedEmail}`;
    
    res.json({ message: responseMessage, token, expiresIn });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
}

export async function resetearContrasena(req, res) {

  const { token, nuevaContrasena } = req.body;

  try {
    // Buscar el usuario por el token de recuperación
    const usuario = await Usuario.findOne({ tokenRecuperacion: token });

    if (!usuario) {
      return res.status(400).json({ message: 'Token de recuperación inválido' });
    }

    // Actualizar la contraseña y el token de recuperación
    usuario.password = nuevaContrasena;
    usuario.tokenRecuperacion = null;

    await usuario.save();

    return res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
}


export const consultarPendientes = async (req, res) => {

  try {
    
    const usuarios_pendientes = await Usuario.find({estado: estadoUsuario.pendiente}) 
    .select('-password -estado -roles -tokenConfirm -cuentaConfirmada -tokenRecuperacion -__v')
    .lean()
    .exec();

    if(usuarios_pendientes.length === 0) {
      return res.status(204).json({ error: "No se han encontrado usuarios pendientes" });
    }

    const usuariosConDatosDocente = await Promise.all(usuarios_pendientes.map(async (usuario) => {
      const datos_docente = await Docente.findOne({usuario: usuario._id})
      .select('-__v -usuario')
      .lean()
      .exec();

      return {
          ...usuario,
          datos_docente: datos_docente
      };
    }));

    return res.json({ usuarios: usuariosConDatosDocente });

  } catch (error) {

    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });

  }

}


export const altaUsuarios = async (req, res) => {

  try {
    const {
        usuarios
    } = req.body

    for(const idUsuario of usuarios){

        const usuario = await Usuario.findById(idUsuario)
        if(!usuario)  
            return res.status(401).json({ error: "No existe el usuario ingresado" });

        const docente = await Docente.findOne({usuario: idUsuario})
        if(!docente)  
            return res.status(401).json({ error: "No existe el docente asociado al usuario" });

        if(usuario.estado == estadoUsuario.pendiente){
            

            usuario.estado = estadoUsuario.activo;
            usuario.save()

            try {
                await emailCola.add("email:altaUsuario", {
                  usuario, 
                  docente})

            } catch (error) {
                console.log({error: "Error al añadir una tarea de envío de email a la cola"})
            }

        } else {
            return res.status(403).json({ error: "Este usuario ya ha sido dado de alta" });
        }
        
    }

    
    return res.json({ ok: true,  responseMessage: "Se han añadido todas las tareas a la cola de envío de mail"});

    

  } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error de servidor" });
  }
}


// const enviarMailSeleccion = async (usuario, docente) => {
//   try {
//       const info = await transporter.sendMail({
//           from: 'Ciencia Conecta',
//           to: usuario.email,
//           subject: "Su cuenta de CienciaConecta ha sido activada",
//           html: altaMailHtml(docente)
//         });

//       // Verificar si el correo se envió exitosamente
//       if (info.accepted.length === 0) {
//           // No se pudo enviar el correo
//           throw new Error(`No se pudo enviar el correo a ${usuario.email}`);
//       }

//   } catch (error) {
//       throw error;
//   }
  
// }