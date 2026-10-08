const Joi = require("joi");


const subscriptionSchema = Joi.object({

    name:Joi.string()
        .min(2)
        .required(),


    provider:Joi.string()
        .required(),


    amount:Joi.number()
        .min(0)
        .required(),


    billingCycle:Joi.string()
        .valid(
            "MONTHLY",
            "YEARLY"
        )
        .required(),


    startDate:Joi.date()
        .required(),


    nextBillingDate:Joi.date()
        .required(),


    category:Joi.string()
        .allow("")
        .optional(),


    status:Joi.string()
        .valid(
            "ACTIVE",
            "CANCELLED"
        )
        .default("ACTIVE")


});


module.exports={
    subscriptionSchema
};