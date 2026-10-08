const Workspace = require("../models/Workspace");
const User = require("../models/User");


/**
 * Helper: what is this user's role inside a given workspace?
 * Returns null if they are not a member at all.
 */
const getMyRole = (workspace, userId) => {

    const membership = workspace.members.find(

        member =>
            member.user &&
            (member.user._id
                ? member.user._id.toString()
                : member.user.toString()
            ) === userId.toString()

    );


    return membership ? membership.role : null;

};


/**
 * GET /api/workspace
 * All workspaces this user belongs to, each tagged with their own role.
 */
const getMyWorkspaces = async(req,res,next)=>{

    try{

        const workspaces = await Workspace.find({
            "members.user":req.user._id
        })
        .sort({ createdAt: 1 });


        const result = workspaces.map(workspace => ({

            _id: workspace._id,

            name: workspace.name,

            owner: workspace.owner,

            memberCount: workspace.members.length,

            myRole: getMyRole(workspace, req.user._id),

            createdAt: workspace.createdAt

        }));


        res.status(200).json({

            workspaces: result

        });


    }
    catch(error){

        next(error);

    }

};


/**
 * GET /api/workspace/:id
 * Full detail (with members) for one workspace the user belongs to.
 */
const getWorkspaceById = async(req,res,next)=>{

    try{

        const { id } = req.params;


        const workspace = await Workspace.findById(id)
        .populate("members.user", "name email");


        if(!workspace){

            return res.status(404).json({
                message:"Workspace not found"
            });

        }


        const myRole = getMyRole(workspace, req.user._id);


        if(!myRole){

            return res.status(403).json({
                message:"You do not have access to this workspace"
            });

        }


        res.status(200).json({

            workspace,

            myRole

        });


    }
    catch(error){

        next(error);

    }

};


/**
 * POST /api/workspace/create
 * Any logged-in user can start a new workspace; they become its OWNER.
 */
const createWorkspace = async(req,res,next)=>{

    try{

        const { name } = req.body;


        if(!name || !name.trim()){

            return res.status(400).json({
                message:"Workspace name is required"
            });

        }


        const workspace =
        await Workspace.create({

            name: name.trim(),

            owner:req.user._id,

            members:[
                {
                    user:req.user._id,
                    role:"OWNER"
                }
            ]

        });


        res.status(201).json({

            message:"Workspace created successfully",

            workspace:{

                _id: workspace._id,

                name: workspace.name,

                owner: workspace.owner,

                memberCount: workspace.members.length,

                myRole: "OWNER",

                createdAt: workspace.createdAt

            }

        });


    }
    catch(error){

        next(error);

    }

};


/**
 * POST /api/workspace/:id/member
 * Only an OWNER of THAT workspace can add people to it.
 */
const addMember = async(req,res,next)=>{

    try{

        const { id } = req.params;

        const { email, role } = req.body;


        if(!email){

            return res.status(400).json({
                message:"Email is required"
            });

        }


        const workspace = await Workspace.findById(id);


        if(!workspace){

            return res.status(404).json({
                message:"Workspace not found"
            });

        }


        if(getMyRole(workspace, req.user._id) !== "OWNER"){

            return res.status(403).json({
                message:"Only the workspace owner can add members"
            });

        }


        const userToAdd = await User.findOne({ email });


        if(!userToAdd){

            return res.status(404).json({
                message:"No user found with this email. They need to register first."
            });

        }


        const alreadyMember =
        workspace.members.find(
            member =>
            member.user.toString() === userToAdd._id.toString()
        );


        if(alreadyMember){

            return res.status(400).json({
                message:"User is already in this workspace"
            });

        }


        workspace.members.push({

            user:userToAdd._id,

            role: role === "VIEWER" ? "VIEWER" : "MEMBER"

        });


        await workspace.save();

        await workspace.populate("members.user", "name email");


        res.status(200).json({

            message:"Member added successfully",

            workspace

        });


    }
    catch(error){

        next(error);

    }

};


/**
 * DELETE /api/workspace/:id/member/:userId
 * Only an OWNER can remove someone, and the owner can't remove themselves.
 */
const removeMember = async(req,res,next)=>{

    try{

        const { id, userId } = req.params;


        const workspace = await Workspace.findById(id);


        if(!workspace){

            return res.status(404).json({
                message:"Workspace not found"
            });

        }


        if(getMyRole(workspace, req.user._id) !== "OWNER"){

            return res.status(403).json({
                message:"Only the workspace owner can remove members"
            });

        }


        if(workspace.owner.toString() === userId){

            return res.status(400).json({
                message:"The workspace owner cannot be removed"
            });

        }


        workspace.members = workspace.members.filter(
            member => member.user.toString() !== userId
        );


        await workspace.save();

        await workspace.populate("members.user", "name email");


        res.status(200).json({

            message:"Member removed successfully",

            workspace

        });


    }
    catch(error){

        next(error);

    }

};


module.exports = {
    getMyWorkspaces,
    getWorkspaceById,
    createWorkspace,
    addMember,
    removeMember
};
