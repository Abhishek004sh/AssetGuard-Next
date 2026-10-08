const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");


/**
 * Figures out WHICH workspace this request is about, and what the
 * logged-in user is allowed to do inside it.
 *
 * The frontend sends the selected workspace as an "x-workspace-id" header.
 * If it isn't sent (old clients, or a user who just logged in), we fall back
 * to the first workspace the user belongs to.
 *
 * After this middleware runs:
 *   req.workspace     -> the Workspace document
 *   req.workspaceRole -> "OWNER" | "MEMBER" | "VIEWER" for THIS user
 */
const workspaceContext = async (req, res, next) => {

    try {

        const workspaceId =
            req.headers["x-workspace-id"] ||
            req.query.workspaceId;


        let workspace;


        if (workspaceId && mongoose.isValidObjectId(workspaceId)) {

            workspace = await Workspace.findById(workspaceId);


            if (!workspace) {

                return res.status(404).json({
                    message: "Workspace not found"
                });

            }

        } else {

            // No workspace chosen yet - use the first one this user belongs to.
            // Older workspaces may only have an "owner" and no members entry,
            // so check both.
            workspace = await Workspace.findOne({
                $or: [
                    { owner: req.user._id },
                    { "members.user": req.user._id }
                ]
            }).sort({ createdAt: 1 });


            if (!workspace) {

                return res.status(404).json({
                    message: "Workspace not found"
                });

            }

        }


        // Is this user actually a member of the workspace they asked for?
        const membership = workspace.members.find(

            member =>
                member.user &&
                member.user.toString() === req.user._id.toString()

        );


        if (!membership) {

            return res.status(403).json({
                message: "You do not have access to this workspace"
            });

        }


        req.workspace = workspace;

        req.workspaceRole = membership.role;


        next();


    } catch (error) {

        next(error);

    }

};


module.exports = workspaceContext;
