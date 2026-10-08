const Joi = require("joi");


const assetSchema = Joi.object({

    name:Joi.string()
        .min(2)
        .required(),


    category:Joi.string()
        .required(),


    description:Joi.string()
        .allow("")
        .optional(),


    purchaseDate:Joi.date()
        .required(),


    purchasePrice:Joi.number()
        .min(0)
        .required(),


    warrantyExpiry:Joi.date()
        .required(),


    serialNumber:Joi.string()
        .allow("")
        .optional(),


    invoiceUrl:Joi.string()
        .allow("")
        .optional()

});


module.exports={
    assetSchema
};