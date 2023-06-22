const {Schema , model} = require('mongoose');

const FeriaSchema = Schema({
    nombre: {
        type: String,
        require: [true , 'El nombre es obligatorio'],
       
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },


})


module.exports = model('Feria', FeriaSchema);