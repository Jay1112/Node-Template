import dotenv from 'dotenv';
dotenv.config();
import { connectToDB } from './db/mongodb.js';
import { app } from './app.js';

const PORT = process.env.PORT || 4000;

connectToDB()
.then(()=>{

    app.on("error",(error)=>{
        console.log("Error : ",error);
        throw error;
    });

    app.listen(PORT,()=>{
        console.log(`Server started on PORT ${PORT}`);
    });
})
.catch((err)=>{
    console.log('MongoDB Connection Failed!',err);
})