export const capitalizarPalabras = (cadena) => {
    return cadena.toLowerCase()
                 .trim()
                 .split(' ')
                 .map( v => v[0].toUpperCase() + v.substr(1) )
                 .join(' ');  
}