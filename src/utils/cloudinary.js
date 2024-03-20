import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

function sendcloudinaryResponse(isSuccess,message,data){
    return {
        success : isSuccess,
        message,
        data
    }
}

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            return sendcloudinaryResponse(false, 'FilePath is empty', null);
        }
        const response = await cloudinary.uploader.upload(localFilePath,{ 
            resource_type : 'auto'
        });
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath); // remove the file
        return null;
    }
} 

export {
    uploadOnCloudinary
}
