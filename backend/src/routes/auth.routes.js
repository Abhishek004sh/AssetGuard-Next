const express = require("express");
const router = express.Router();
const {registerUser,loginUser,getMe} = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { registerSchema,loginSchema } = require("../validations/auth.validation");
const protect = require("../middleware/auth.middleware");

router.post(
"/login",
validate(loginSchema),
loginUser
);

router.post(
"/register",
validate(registerSchema),
registerUser
);

router.get(
"/me",
protect,
getMe
);



module.exports = router;