import xlsx from 'xlsx';


export const validarCamposExcel = (archivo) => {
  try {
    const workbook = xlsx.readFile(archivo.filepath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const validarCampo = (letra, numeroFila, palabras) => {
      const cellAddress = letra + numeroFila;
      const cell = sheet[cellAddress];
      if (!cell || !cell.v) {
        return { valido: false, campo: palabras[0] };
      }
    
      const valor = cell.v.toString().toLowerCase();
      if (palabras.some(palabra => valor.includes(palabra.toLowerCase()))) {
        return { valido: true, campo: '' };
      } else {
        return { valido: false, campo: palabras[0] }; 
      }
    };

    const validar = (letra, numeroFila, palabras) => {
      const { valido, campo } = validarCampo(letra, numeroFila, palabras);
      if (!valido) {
        return { formatoCorrecto: false, campo: campo, posicion: `${letra}${numeroFila}` };
      }
      return { formatoCorrecto: true, campo: '', posicion: '' };
    };

    const campos = [
      validar('A', 13, ['jurisdicción', 'jurisdiccion', 'provincia']),
      validar('D', 13, ['departamento']),
      validar('F', 13, ['localidad']),
      validar('H', 13, ['cueanexo', 'cue', 'cue anexo', 'cue-anexo']),
      validar('I', 13, ['nombre']),
      validar('J', 13, ['domicilio']),
      validar('K', 13, ['c. p.', 'cp', 'c.p', 'c.p.', 'c p', 'c. p']),
      validar('L', 13, ['teléfono', 'telefono']),
      validar('M', 13, ['mail', 'email', 'e-mail'])
    ];

    const campoError = campos.find(campo => !campo.formatoCorrecto);
    if (campoError) {
      return { formatoCorrecto: false, campo: campoError.campo, posicion: campoError.posicion };
    }

    return { formatoCorrecto: true, campo: 'Todos los campos son correctos', posicion: '' };

  } catch (error) {
    console.error(error);
    return { formatoCorrecto: false, campo: 'Error al procesar el archivo Excel', posicion: '' };
  }
};


export const validarHojasExcel = (archivo) => {
    try {
      const workbook = xlsx.readFile(archivo.filepath);
      const sheetNames = workbook.SheetNames;
  
      if (sheetNames.length !== 1) {
        return false;
      }
  
      const sheetName = sheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rowCount = sheet['!ref'].split(':').pop().match(/\d+/)[0];
  
      return rowCount >= 5000;
    } catch (error) {
      console.error(error);
      return false;
    }
  };



  export const validarCueAnexo = (archivo) => {
    try {
      const workbook = xlsx.readFile(archivo.filepath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      const validarCueAnexo = (letra, numeroFila) => {
        const cellAddress = letra + numeroFila;
        const cell = sheet[cellAddress];
        if (!cell || !cell.v) {
          return { valido: false, campo: '' };
        }
  
        const cueAnexoRegex = /^\d{9}$/;
        if (cueAnexoRegex.test(cell.v)) {
          return { valido: true, campo: '' };
        } else {
          return { valido: false, campo: cell.v.toString() };
        }
      };
  
      const resultadoValidacion = validarCueAnexo('H', 14);
  
      if (!resultadoValidacion.valido) {
        return false;
      }
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };