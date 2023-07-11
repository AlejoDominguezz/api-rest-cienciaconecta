import {Schema , model} from 'mongoose';

const feriaSchema = new Schema({
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


export const Feria = model('Feria', feriaSchema);