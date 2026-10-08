const Workspace = require("../models/Workspace");
const Asset = require("../models/Asset");
const Subscription = require("../models/Subscription");


const getDashboard = async(req,res,next)=>{

    try{

        const workspace = req.workspace;


        // Assets

        const assets = await Asset.find({

            workspace:workspace._id

        });


        let warrantyExpiring = 0;


        const today = new Date();


        assets.forEach(asset=>{


            const expiry =
            new Date(asset.warrantyExpiry);


            const difference =
            Math.ceil(

                (expiry - today)
                /
                (1000*60*60*24)

            );


            if(difference <=30 && difference >=0){

                warrantyExpiring++;

            }

        });



        // Subscriptions

        const subscriptions =
        await Subscription.find({

            workspace:workspace._id,

            status:"ACTIVE"

        });


        let monthlyExpense = 0;


        subscriptions.forEach(sub=>{


            if(sub.billingCycle==="MONTHLY"){

                monthlyExpense += sub.amount;

            }
            else{

                monthlyExpense += sub.amount/12;

            }


        });



        const upcomingRenewals =
        subscriptions.filter(sub=>{


            const date =
            new Date(sub.nextBillingDate);


            const diff =
            Math.ceil(

                (date-today)
                /
                (1000*60*60*24)

            );


            return diff<=30 && diff>=0;


        });



        res.status(200).json({

            assets:{

                total:assets.length,

                warrantyExpiring

            },


            subscriptions:{

                total:subscriptions.length,

                monthlyExpense:Math.round(monthlyExpense),

                upcomingRenewals:
                upcomingRenewals.length

            }


        });


    }
    catch(error){

        next(error);

    }

};


module.exports={
    getDashboard
};