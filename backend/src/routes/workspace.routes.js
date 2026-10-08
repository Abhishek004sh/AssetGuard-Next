const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");

const {
    getMyWorkspaces,
    getWorkspaceById,
    createWorkspace,
    addMember,
    removeMember
} = require("../controllers/workspace.controller");


// List every workspace the user belongs to (with their role in each)
router.get(
"/",
protect,
getMyWorkspaces
);

// Any logged-in user can create their own workspace
router.post(
"/create",
protect,
createWorkspace
);

// Owner-only actions are checked inside the controller, because the
// permission depends on the workspace in the URL - not on a global role.
router.post(
"/:id/member",
protect,
addMember
);

router.delete(
"/:id/member/:userId",
protect,
removeMember
);

// Keep this last so "/create" isn't swallowed by "/:id"
router.get(
"/:id",
protect,
getWorkspaceById
);


module.exports = router;
