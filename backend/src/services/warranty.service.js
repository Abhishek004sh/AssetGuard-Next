const Asset = require("../models/Asset");
const createNotification =
require("./notification.service");


const checkWarranty =
async()=>{


    const assets =
    await Asset.find();


    const today = new Date();


    for(let asset of assets){


        const expiry =
        new Date(asset.warrantyExpiry);


        const difference =
        Math.ceil(
            (expiry - today)
            /
            (1000*60*60*24)
        );


        if(
            difference <=15 &&
            difference >=0
        ){

            await createNotification({

                title:"Warranty Alert",

                message:
                `${asset.name} warranty expires in ${difference} days`,

                type:"WARRANTY",

                user:asset.addedBy,

                workspace:asset.workspace

            });


        }


    }


};


module.exports = checkWarranty;