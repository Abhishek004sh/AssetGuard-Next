/**
 * Checks the user's role INSIDE the current workspace.
 *
 * The same person can be an OWNER of their own
 * workspace and only a MEMBER in someone else's, so permissions have to
 * come from the membership, not from the user account.
 *
 * Must run AFTER workspaceContext, which sets req.workspaceRole.
 */
const authorizeWorkspaceRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.workspaceRole) {

            return res.status(403).json({
                message: "No workspace access"
            });

        }


        if (!allowedRoles.includes(req.workspaceRole)) {

            return res.status(403).json({
                message: `Access denied. This action requires: ${allowedRoles.join(" or ")}`
            });

        }


        next();

    };

};


module.exports = authorizeWorkspaceRoles;
