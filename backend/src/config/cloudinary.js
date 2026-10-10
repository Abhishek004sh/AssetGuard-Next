const cloudinary = require("cloudinary").v2;


const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;


// Warn loudly at startup instead of only failing silently on the first
// invoice upload with Cloudinary's raw "Must supply api_key" error.
if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {

    console.warn(
        "Cloudinary is not fully configured - invoice uploads will fail.\n" +
        "Check that backend/.env has CLOUDINARY_NAME, CLOUDINARY_API_KEY and " +
        "CLOUDINARY_API_SECRET set (see backend/.env.example)."
    );

}


cloudinary.config({

    cloud_name:CLOUDINARY_NAME,

    api_key:CLOUDINARY_API_KEY,

    api_secret:CLOUDINARY_API_SECRET

});


module.exports = cloudinary;
