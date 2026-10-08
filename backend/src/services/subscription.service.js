const Subscription = require("../models/Subscription");

const createNotification =
require("./notification.service");


const checkSubscriptionRenewals = async()=>{


    const subscriptions =
    await Subscription.find({
        status:"ACTIVE"
    });


    const today = new Date();


    for(let subscription of subscriptions){


        const renewalDate =
        new Date(subscription.nextBillingDate);


        const difference =
        Math.ceil(
            (renewalDate - today)
            /
            (1000*60*60*24)
        );


        if(
            difference <=7 &&
            difference >=0
        ){


            await createNotification({

                title:"Subscription Renewal Alert",

                message:
                `${subscription.name} renews in ${difference} days`,

                type:"SUBSCRIPTION",

                user:subscription.addedBy,

                workspace:subscription.workspace

            });


        }


    }


};


module.exports =
checkSubscriptionRenewals;