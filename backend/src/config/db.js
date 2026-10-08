const mongoose = require("mongoose");


const connectDB = async () => {

    // Accept either spelling so a .env written as Mongo_URI still works.
    const uri =
        process.env.MONGO_URI ||
        process.env.Mongo_URI;

    if (!uri) {

        console.log(
            "MongoDB connection string missing. Add MONGO_URI to backend/.env"
        );

        process.exit(1);

    }

    try {

        const conn = await mongoose.connect(uri);

        console.log(
            `MongoDB Connected: ${conn.connection.host}`
        );

    } catch(error){

        console.log(
            "MongoDB Connection Failed",
            error.message
        );

        process.exit(1);
    }
};


module.exports = connectDB;
