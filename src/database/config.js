import mongoose from 'mongoose';

const dbConnection = async() =>{

    try {
        //await mongoose.connect( process.env.URI_MONGODB)
        await mongoose.connect( process.env.URI_MONGODB,{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log('bd se encuentra on-line')
    } catch (error) {
        console.log(error)
        throw new Error('Error a la hora de inciar la base de datos - revisar')
    }

}


export default dbConnection;
