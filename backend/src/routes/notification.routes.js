const express = require("express");

const router = express.Router();

const protect =
require("../middleware/auth.middleware");


const {
    getNotifications
}=require("../controllers/notification.controller");

const checkWarranty =
require("../services/warranty.service");

const checkSubscriptionRenewals =
require("../services/subscription.service");

router.get(
"/",
protect,
getNotifications
);


router.get(
"/check-warranty",
protect,
async(req,res)=>{

    await checkWarranty();

    res.json({
        message:"Warranty check completed"
    });

});

router.get(
"/check-subscriptions",
protect,
async(req,res)=>{

    await checkSubscriptionRenewals();

    res.json({
        message:"Subscription check completed"
    });

});

module.exports = router;