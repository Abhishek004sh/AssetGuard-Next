const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema(
{

    title:{
        type:String,
        required:true
    },


    message:{
        type:String,
        required:true
    },


    type:{
        type:String,
        enum:[
            "WARRANTY",
            "SUBSCRIPTION",
            "SYSTEM"
        ],
        default:"SYSTEM"
    },


    isRead:{
        type:Boolean,
        default:false
    },


    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Workspace",
        required:true
    }


},
{
    timestamps:true
});


module.exports =
mongoose.model(
    "Notification",
    notificationSchema
);