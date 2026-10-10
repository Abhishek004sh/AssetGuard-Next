const Asset = require("../models/Asset");
const uploadToCloudinary = require("../utils/cloudinaryUpload");


// Every route below runs after workspaceContext, so req.workspace is the
// workspace the user currently has selected, and req.workspaceRole is the
// role they hold inside it.


const createAsset = async(req,res,next)=>{

    try{

        const {
            name,
            category,
            description,
            purchaseDate,
            purchasePrice,
            warrantyExpiry,
            serialNumber,
            invoiceUrl
        } = req.body;


        const asset = await Asset.create({

            name,

            category,

            description,

            purchaseDate,

            purchasePrice,

            warrantyExpiry,

            serialNumber,

            invoiceUrl,

            workspace:req.workspace._id,

            addedBy:req.user._id

        });


        res.status(201).json({

            message:"Asset created successfully",

            asset

        });


    }
    catch(error){

        next(error);

    }

};


const getAssets = async(req,res,next)=>{

    try{
        const {
            page = 1,
            limit = 10,
            search = "",
            sort = "createdAt"
        } = req.query;


        const query = {
            workspace:req.workspace._id
        };


        if(search){

            query.name = {
                $regex: search,
                $options:"i"
            };

        }


        const assets =
        await Asset.find(query)
        .populate("addedBy","name email")
        .sort({
            [sort]:-1
        })
        .limit(limit * 1)
        .skip(
            (page - 1) * limit
        );


        const total =
        await Asset.countDocuments(query);


        res.status(200).json({

            assets,

            // The frontend uses this to decide which buttons to show
            myRole: req.workspaceRole,

            workspace:{
                _id: req.workspace._id,
                name: req.workspace.name
            },

            pagination:{
                total,
                page:Number(page),
                pages:Math.ceil(total/limit)
            }

        });


    }
    catch(error){

        next(error);

    }

};


const updateAsset = async(req,res,next)=>{

    try{

        const {
            id
        } = req.params;


        const asset = await Asset.findById(id);


        if(!asset){

            return res.status(404).json({

                message:"Asset not found"

            });

        }


        // The asset must belong to the workspace the user is currently in,
        // otherwise someone could edit another workspace's data by ID.
        if(
            asset.workspace.toString() !==
            req.workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot update this asset"

            });

        }


        // Never let the workspace/owner fields be overwritten from the body
        const { workspace, addedBy, ...safeUpdates } = req.body;


        const updatedAsset =
        await Asset.findByIdAndUpdate(

            id,

            safeUpdates,

            {
                new:true
            }

        ).populate("addedBy","name email");


        res.status(200).json({

            message:"Asset updated successfully",

            asset:updatedAsset

        });


    }
    catch(error){

        next(error);

    }

};


const deleteAsset = async(req,res,next)=>{

    try{

        const {
            id
        } = req.params;


        const asset = await Asset.findById(id);


        if(!asset){

            return res.status(404).json({

                message:"Asset not found"

            });

        }


        if(
            asset.workspace.toString() !==
            req.workspace._id.toString()
        ){

            return res.status(403).json({

                message:"You cannot delete this asset"

            });

        }


        // Second safety net: the route already requires OWNER, but checking
        // here too means the rule holds even if the route is ever changed.
        if(req.workspaceRole !== "OWNER"){

            return res.status(403).json({

                message:"Only the workspace owner can delete assets"

            });

        }


        await Asset.findByIdAndDelete(id);


        res.status(200).json({

            message:"Asset deleted successfully"

        });


    }
    catch(error){

        next(error);

    }

};


const getWarrantyStatus = async(req,res,next)=>{

    try{

        const assets = await Asset.find({

            workspace: req.workspace._id

        });


        let active = 0;
        let expiringSoon = 0;
        let expired = 0;


        const today = new Date();


        assets.forEach(asset=>{


            const expiry =
            new Date(asset.warrantyExpiry);


            const diff =
            Math.ceil(
                (expiry - today)
                /
                (1000*60*60*24)
            );


            if(diff < 0){

                expired++;

            }
            else if(diff <= 30){

                expiringSoon++;

            }
            else{

                active++;

            }


        });


        res.status(200).json({

            totalAssets:assets.length,

            active,

            expiringSoon,

            expired

        });


    }
    catch(error){

        next(error);

    }

};


const uploadInvoice = async (req, res,next) => {
    try {

        const { id } = req.params;

        const asset = await Asset.findById(id);

        if (!asset) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        if (
            asset.workspace.toString() !==
            req.workspace._id.toString()
        ) {
            return res.status(403).json({
                message: "You cannot upload invoice for this asset"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        let result;

        try{

            result = await uploadToCloudinary(req.file.buffer);

        }
        catch(uploadError){

            // Cloudinary's own error ("Must supply api_key" etc.) is a
            // config problem on our side, not something the user caused -
            // don't leak the raw SDK message to them.
            console.error("Cloudinary upload failed:", uploadError.message);

            return res.status(500).json({
                message: "Invoice upload is not configured correctly on the server. Check Cloudinary credentials in backend/.env."
            });

        }

        asset.invoiceUrl = result.secure_url;

        await asset.save();

        res.status(200).json({
            message: "Invoice uploaded successfully",
            invoiceUrl: asset.invoiceUrl
        });

    } catch (error) {

        next(error);

    }
};

module.exports = {
    createAsset,
    getAssets,
    updateAsset,
    deleteAsset,
    getWarrantyStatus,
    uploadInvoice
};
