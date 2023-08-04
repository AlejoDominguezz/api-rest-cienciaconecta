import { google } from "googleapis";

//credenciales de la cuenta de servicio


//servicio de googleapis que utilizaré
const SCOPES = ["https://www.googleapis.com/auth/drive"];


// Crear la autenticación y configurar el cliente de Google Drive
const auth = new google.auth.GoogleAuth({
  credentials:process.env.CREDENTIALS_DRIVE,
  scopes: SCOPES,
});

//instancia de drive creada
export const drive = google.drive({ version: "v3", auth });

