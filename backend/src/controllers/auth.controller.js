const User = require("../models/User");
const Workspace = require("../models/Workspace");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const registerUser = async (req,res,next)=>{

    try{

        const {
            name,
            email,
            password
        } = req.body;


        // Check existing user
        const existingUser = await User.findOne({
            email
        });


        if(existingUser){
            return res.status(400).json({
                message:"User already exists"
            });
        }


        // Password Hashing
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );


        // Create User

        const user = await User.create({

            name,

            email,

            password:hashedPassword,

            role: req.body.role || "OWNER"

        });


        // Every new user gets their own personal workspace and is the OWNER
        // of it. They can still be added to other people's workspaces later
        // as a MEMBER - the role is stored per workspace, not on the account.
        await Workspace.create({

            name: `${user.name}'s Workspace`,

            owner: user._id,

            members: [
                {
                    user: user._id,
                    role: "OWNER"
                }
            ]

        });


        // Log the user in straight away, exactly like the login route does,
        // so the frontend can go directly to the dashboard.
        const token = generateToken(user._id);


        res.status(201).json({

            message:"User registered successfully",

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        });


    }
    catch(error){

        next(error);

    }

};


const loginUser = async(req,res,next)=>{

    try{

        const {
            email,
            password
        }=req.body;


        const user = await User.findOne({
            email
        });


        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }


        const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );


        if(!isPasswordCorrect){

            return res.status(401).json({
                message:"Invalid password"
            });

        }


        const token = generateToken(user._id);


        res.status(200).json({

            message:"Login successful",

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        });


    }
    catch(error){

        next(error);

    }

};


const getMe = async(req,res,next)=>{

    try{

        // req.user is already set by the protect middleware (password excluded)
        res.status(200).json({

            user:{
                id:req.user._id,
                name:req.user.name,
                email:req.user.email,
                role:req.user.role
            }

        });

    }
    catch(error){

        next(error);

    }

};


module.exports = {
    registerUser,
    loginUser,
    getMe
};
