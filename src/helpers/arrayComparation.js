export const arraysEvaluacionIguales = (arr1, arr2) => {
  // Verificar si ambos arrays tienen la misma longitud
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Comparar cada elemento en el mismo orden
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    // Verificar si "opcionSeleccionada" de cada criterio es igual
    if (item1.rubricaId.toString() === item2.rubricaId.toString() &&
        item1.criterioId.toString() === item2.criterioId.toString() &&
        item1.opcionSeleccionada.toString() !== item2.opcionSeleccionada.toString()) {
      return false; // "opcionSeleccionada" ha cambiado
    }

  }

  // Si llegamos aquí, los arrays son iguales
  return true;
};



export const arraysComentariosIguales = (arr1, arr2) => {
  // Verificar si ambos arrays tienen la misma longitud
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Verificar si "comentario" de cada rubrica es igual
  const comentarios1 = arr1 || []
  const comentarios2 = arr2 || [];

  for (let j = 0; j < comentarios1.length; j++) {
    const comentario1 = comentarios1[j];
    const comentario2 = comentarios2[j];

    if (comentario1.rubricaId.toString() === comentario2.rubricaId.toString() &&
        comentario1.comentario !== comentario2.comentario) {
      return false; // El comentario ha cambiado
    }
  }

  // Si llegamos aquí, los arrays son iguales
  return true;

};