const cron = require("node-cron");

const checkWarranty =
require("../services/warranty.service");

const checkSubscriptionRenewals =
require("../services/subscription.service");



cron.schedule(
"0 9 * * *",
async()=>{

    console.log(
        "Running notification check..."
    );


    await checkWarranty();

    await checkSubscriptionRenewals();


    console.log(
        "Notification check completed"
    );

});