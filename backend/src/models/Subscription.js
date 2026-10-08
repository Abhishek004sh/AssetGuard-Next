const mongoose = require("mongoose");


const subscriptionSchema = new mongoose.Schema(
{

    name:{
        type:String,
        required:true
    },


    provider:{
        type:String,
        required:true
    },


    amount:{
        type:Number,
        required:true
    },


    billingCycle:{
        type:String,
        enum:[
            "MONTHLY",
            "YEARLY"
        ],
        default:"MONTHLY"
    },


    startDate:{
        type:Date
    },


    nextBillingDate:{
        type:Date,
        required:true
    },


    category:{
        type:String,
        default:"OTHER"
    },


    status:{
        type:String,
        enum:[
            "ACTIVE",
            "CANCELLED"
        ],
        default:"ACTIVE"
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
    "Subscription",
    subscriptionSchema
);