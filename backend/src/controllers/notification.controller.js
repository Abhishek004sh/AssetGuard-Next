const Notification = require("../models/Notification");


const getNotifications = async(req,res,next)=>{

    try{

        const notifications =
        await Notification.find({

            user:req.user._id

        })
        .sort({
            createdAt:-1
        });


        res.status(200).json({

            notifications

        });


    }
    catch(error){

        next(error);

    }

};


module.exports={
    getNotifications
};