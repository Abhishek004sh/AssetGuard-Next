const cloudinary = require("../config/cloudinary");


const uploadToCloudinary = (fileBuffer)=>{

    return new Promise((resolve,reject)=>{


        cloudinary.uploader.upload_stream(

            {
                resource_type:"auto"
            },


            (error,result)=>{


                if(error){

                    reject(error);

                }
                else{

                    resolve(result);

                }


            }

        ).end(fileBuffer);


    });

};


module.exports = uploadToCloudinary;