const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const workspaceContext = require("../middleware/workspace.middleware");
const authorizeWorkspaceRoles = require("../middleware/workspaceRole.middleware");
const validate = require("../middleware/validate.middleware");
const { subscriptionSchema } = require("../validations/subscription.validation");
const {

createSubscription,
getSubscriptions,
getSubscriptionStats,
updateSubscription,
deleteSubscription

}=require("../controllers/subscription.controller");


router.get(
"/stats",
protect,
workspaceContext,
getSubscriptionStats
);

router.get(
"/",
protect,
workspaceContext,
getSubscriptions
);

router.post(
"/",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER","MEMBER"),
validate(subscriptionSchema),
createSubscription
);

router.put(
"/:id",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER","MEMBER"),
updateSubscription
);

router.delete(
"/:id",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER"),
deleteSubscription
);


module.exports = router;
