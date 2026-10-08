const Subscription = require("../models/Subscription");


const createSubscription = async(req,res,next)=>{

    try{

        const {
            name,
            provider,
            amount,
            billingCycle,
            startDate,
            nextBillingDate,
            category
        } = req.body;


        const workspace = req.workspace;


        const subscription =
        await Subscription.create({

            name,

            provider,

            amount,

            billingCycle,

            startDate,

            nextBillingDate,

            category,

            workspace:workspace._id,

            addedBy:req.user._id

        });


        res.status(201).json({

            message:"Subscription created successfully",

            subscription

        });


    }
    catch(error){

        next(error);

    }

};

const getSubscriptions = async(req,res,next)=>{

    try{

        const {
            page = 1,
            limit = 10,
            search = "",
            sort = "createdAt"
        } = req.query;


        const workspace = req.workspace;


        const query = {
            workspace:workspace._id
        };


        if(search){

            query.name = {
                $regex:search,
                $options:"i"
            };

        }


        const subscriptions =
        await Subscription.find(query)
        .sort({
            [sort]:-1
        })
        .limit(limit * 1)
        .skip(
            (page - 1) * limit
        );


        const total =
        await Subscription.countDocuments(query);


        res.status(200).json({

            subscriptions,

            pagination:{
                total,
                page:Number(page),
                pages:Math.ceil(total/limit)
            }

        });


    }
    catch(error){

        next(error);

    }

};

const getSubscriptionStats = async(req,res,next)=>{

    try{

        const workspace = req.workspace;


        const subscriptions =
        await Subscription.find({

            workspace:workspace._id,

            status:"ACTIVE"

        });


        let monthlyExpense = 0;


        subscriptions.forEach(sub=>{


            if(sub.billingCycle === "MONTHLY"){

                monthlyExpense += sub.amount;

            }


            else if(sub.billingCycle === "YEARLY"){

                monthlyExpense += 
                sub.amount / 12;

            }


        });


        const yearlyExpense =
        monthlyExpense * 12;


        const today = new Date();


        const upcomingRenewals =
        subscriptions.filter(sub=>{


            const billingDate =
            new Date(sub.nextBillingDate);


            const difference =
            Math.ceil(

            (billingDate - today)
            /
            (1000*60*60*24)

            );


            return difference <=30 && difference>=0;


        });


        res.status(200).json({

            totalSubscriptions:
            subscriptions.length,


            monthlyExpense:
            Math.round(monthlyExpense),


            yearlyExpense:
            Math.round(yearlyExpense),


            upcomingRenewals:
            upcomingRenewals.length


        });


    }
    catch(error){

        next(error);

    }

};

const updateSubscription = async(req,res,next)=>{

    try{

        const { id } = req.params;


        const subscription =
        await Subscription.findById(id);


        if(!subscription){

            return res.status(404).json({

                message:"Subscription not found"

            });

        }


        const workspace = req.workspace;


        // Workspace ownership check

        if(
            subscription.workspace.toString()
            !==
            workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot update this subscription"

            });

        }


        const updatedSubscription =
        await Subscription.findByIdAndUpdate(

            id,

            req.body,

            {
                new:true
            }

        );


        res.status(200).json({

            message:"Subscription updated successfully",

            subscription:updatedSubscription

        });


    }
    catch(error){

        next(error);

    }

};

const deleteSubscription = async(req,res,next)=>{

    try{

        const { id } = req.params;


        const subscription =
        await Subscription.findById(id);


        if(!subscription){

            return res.status(404).json({

                message:"Subscription not found"

            });

        }


        const workspace = req.workspace;


        if(
            subscription.workspace.toString()
            !==
            workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot delete this subscription"

            });

        }


        await Subscription.findByIdAndDelete(id);


        res.status(200).json({

            message:"Subscription deleted successfully"

        });


    }
    catch(error){

        next(error);

    }

};


module.exports = {
    createSubscription,
    getSubscriptions,
    getSubscriptionStats,
    updateSubscription,
    deleteSubscription
};