const Notification = require("../models/Notification");


const createNotification = async(data)=>{

    try{

        const notification =
        await Notification.create(data);


        return notification;


    }
    catch(error){

        throw error;

    }

};


module.exports = createNotification;