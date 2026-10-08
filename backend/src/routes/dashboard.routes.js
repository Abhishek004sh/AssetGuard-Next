const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const workspaceContext = require("../middleware/workspace.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");


router.get(
"/",
protect,
workspaceContext,
getDashboard
);


module.exports = router;
