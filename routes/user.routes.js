const express = require("express");
const router = express.Router();

const { login, sendmailpassword, sendmailemail, changePassword } = require("../controllers/usercontroller");
const { register } = require("../controllers/usercontroller");



router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", sendmailpassword);
router.post("/change-email", sendmailemail)
router.post("/forgot-password/:userId/:OTP", changePassword);




module.exports = router;
