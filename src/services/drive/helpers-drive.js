import fs from "fs";
//promesa para crear una nueva carpeta en drive
export const createFolder = async (folderName, drive) => {
  try {
    const response = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    return response.data.id;
  } catch (error) {
    console.error("Error al crear la carpeta:", error.message);
    throw error;
  }
};

export const shareFolderWithPersonalAccount = async (
  folderId,
  personalAccountEmail,
  drive,
  permiso
) => {
  const permission = {
    type: "user",
    role: permiso, // Puedes ajustar el rol según tus necesidades (reader, writer, owner, etc.)
    emailAddress: personalAccountEmail,
  };

  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: permission,
      fields: "id",
    });

    console.log(`Carpeta compartida con éxito con ${personalAccountEmail}.`);
  } catch (error) {
    console.error("Error al compartir la carpeta:", error.message);
    throw error;
  }
};


export const sendFileToDrive = (files_pdf, myFolder, drive) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { originalFilename: pdfName, filepath: pdfPath } = files_pdf;

      const fileMetadata = {
        name: pdfName,
        parents: [myFolder],
        mimeType: "application/pdf",
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media: {
          mimeType: "application/pdf",
          body: fs.createReadStream(pdfPath),
        },
        fields: "id",
      });

      // Eliminar el archivo temporal después de subirlo a Drive
      fs.unlinkSync(pdfPath);

      console.log("Archivo PDF subido. ID:", response.data.id);
      resolve(response.data.id);
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
      reject(error);
    }
  });
};

export const downloadCv = async (drive, fileId, res) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    // // Obtener el nombre del archivo desde la respuesta de Google Drive
    // const fileName =
    //   response.headers["content-disposition"].split("filename=")[1];

    // // Configurar las cabeceras de respuesta con el nombre del archivo
    // res.setHeader("Content-disposition", `attachment; filename="${fileName}"`);
    // res.setHeader("Content-type", response.headers["content-type"]);

    // response.data.pipe(res);
    // Obtener el nombre del archivo desde el encabezado "content-disposition"
    let fileName =
      response.headers["content-disposition"].match(/filename="(.+)"/);
    if (fileName && fileName[1]) {
      fileName = fileName[1];
    } else {
      // Si no se encuentra un nombre de archivo válido, proporciona un nombre predeterminado
      fileName = "cv.pdf";
    }
    console.log(response);
    // Configurar las cabeceras de respuesta con el nombre del archivo
    res.setHeader("Content-disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (err) {
    console.error("Error al descargar el archivo desde Drive:", err);
    res.status(500).json({
      message: "Error al descargar el archivo desde Drive",
    });
  }
};

export const downloadCvTwo = async (drive, fileId, res) => {
  try {
    const respt = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );
    const fileBuffer = Buffer.from(respt.data, "binary");

    // Configura los encabezados de respuesta para indicar que es un archivo binario
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=cv.pdf");

    // Envía el archivo binario como respuesta
    res.send(fileBuffer);
  } catch (err) {
    console.error("Error al descargar el archivo desde Drive:", err);
    res.status(500).json({
      message: "Error al descargar el archivo desde Drive",
    });
  }
};

export const download_Cv = async (drive, fileId, res) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    let fileName =
      response.headers["content-disposition"].match(/filename="(.+)"/);
    if (fileName && fileName[1]) {
      fileName = fileName[1];
    } else {
      // Si no se encuentra un nombre de archivo válido, proporciona un nombre predeterminado
      fileName = "cv.pdf";
    }
    
    // Configurar las cabeceras de respuesta para mostrar el PDF en lugar de descargarlo
    res.setHeader("Content-disposition", `inline; filename="${fileName}"`);
    res.setHeader("Content-type", "application/pdf");

    response.data.pipe(res);
  } catch (err) {
    console.error("Error al descargar el archivo desde Drive:", err);
    res.status(500).json({
      message: "Error al descargar el archivo desde Drive",
    });
  }
};

export const getIdByUrl = (url) => {
  const match = url.match(/\/file\/d\/([^/]+)\//);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export const deleteFile = (fileId, drive) => {
  return new Promise(async (resolve, reject) => {
    try {
      await drive.files.delete({
        fileId: fileId,
      });
      console.log(`Archivo con ID ${fileId} eliminado correctamente.`);
      resolve(true); // El archivo se eliminó con éxito
    } catch (error) {
      console.error(`Error al eliminar el archivo con ID ${fileId}:`, error.message);
      reject(false); // Error al eliminar el archivo
    }
  });
};

// Función para obtener los IDs de archivos en una carpeta
export const obtenerIDsDeArchivosEnCarpeta = async (folderId , drive) => {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id)',
    });
    const files = response.data.files;
    const fileIds = files.map(file => file.id);
    return fileIds;
  } catch (error) {
    console.error('Error al obtener los IDs de archivos:', error);
    throw error;
  }
};


export const downloadFiles = async(fileId, drive) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );
    const archivo = await streamToBuffer(response.data);
    return archivo;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
// Función para convertir un flujo de lectura a un búfer
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export const DownloadFileByUrl = async (drive, fileId, res , name) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    let fileName =
      response.headers["content-disposition"].match(/filename="(.+)"/);
    if (fileName && fileName[1]) {
      fileName = fileName[1];
    } else {
      // Si no se encuentra un nombre de archivo válido, proporciona un nombre predeterminado
      fileName = `${name}`;
    }
    
    // Configurar las cabeceras de respuesta para mostrar el PDF en lugar de descargarlo
    res.setHeader("Content-disposition", `inline; filename="${fileName}"`);
    res.setHeader("Content-type", "application/pdf");

    response.data.pipe(res);
  } catch (err) {
    console.error("Error al descargar el archivo desde Drive:", err);
    res.status(500).json({
      message: "Error al descargar el archivo desde Drive",
    });
  }
};

export const getFileNameById = async(drive, fileId) => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: "name",
    });

    const fileName = response.data.name;
    console.log('NOMBRE ARCHIVO',fileName);
    return fileName;
  } catch (error) {
    console.error("Error al obtener el nombre del archivo:", error.message);
    throw error;
  }
}