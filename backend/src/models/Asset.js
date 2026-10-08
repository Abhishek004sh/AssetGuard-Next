const mongoose = require("mongoose");


const assetSchema = new mongoose.Schema(
{

    name:{
        type:String,
        required:true
    },


    category:{
        type:String,
        required:true
    },


    description:{
        type:String
    },


    purchaseDate:{
        type:Date
    },


    purchasePrice:{
        type:Number
    },


    warrantyExpiry:{
        type:Date
    },


    serialNumber:{
        type:String
    },


    invoiceUrl:{
        type:String
    },


    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Workspace",
        required:true
    },


    addedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},
{
    timestamps:true
});


module.exports =
mongoose.model(
    "Asset",
    assetSchema
);