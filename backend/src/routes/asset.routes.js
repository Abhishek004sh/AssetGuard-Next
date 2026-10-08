const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const workspaceContext = require("../middleware/workspace.middleware");
const authorizeWorkspaceRoles = require("../middleware/workspaceRole.middleware");
const upload = require("../middleware/upload.middleware");

const {

createAsset,
getAssets,
updateAsset,
deleteAsset,
getWarrantyStatus,
uploadInvoice

}=require("../controllers/asset.controller");

const validate = require("../middleware/validate.middleware");
const { assetSchema } = require("../validations/asset.validation");


// Anyone in the workspace can read
router.get(
"/",
protect,
workspaceContext,
getAssets
);

router.get(
"/warranty-status",
protect,
workspaceContext,
getWarrantyStatus
);

// OWNER and MEMBER can add and edit. VIEWER is read-only.
router.post(
"/",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER","MEMBER"),
validate(assetSchema),
createAsset
);

router.put(
"/:id",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER","MEMBER"),
updateAsset
);

router.post(
"/:id/invoice",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER","MEMBER"),
upload.single("invoice"),
uploadInvoice
);

// Deleting is destructive - OWNER only.
router.delete(
"/:id",
protect,
workspaceContext,
authorizeWorkspaceRoles("OWNER"),
deleteAsset
);


module.exports = router;
