import mongoose from 'mongoose';
import { logger } from '../logger.js';

const dbConnection = async() =>{

    try {
        await mongoose.connect( process.env.URI_MONGODB)
        logger.info('Mongo DB se encuentra online')
    } catch (error) {
        logger.error(error)
        throw new Error('Error a la hora de inciar la base de datos')
    }

}


export default dbConnection;
