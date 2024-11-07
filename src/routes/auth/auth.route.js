const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require("../../controllers/web/AuthController");

const validator = require("../../helpers/validator-processor");

//initial signup
router.get("/signup", authController.getRegistrationPage);
//sign in
router.get("/signin", authController.getSigninPage);
//get login redirect page
router.get("/login/redirect", authController.getSigninRedirectPage);
// get mobile login redirect page
router.get("/mobile/redirect", authController.getMobileAppRedirect);
//post initiate signin
router.post("/initiate-signin", authController.postInitiateSigin);
router.post(
	"/initiate-signup",
	validator.validateInitialSignup,
	authController.postInitialSignup
);

router.get("/verify-account", authController.getVerifyAccount);
// verify code
router.post("/verify-account", authController.postVerifyAccount);
// complete registration
router.get("/complete-registration", authController.getCompleteRegistration);
// post complete registration
router.post("/complete-registration", authController.postCompleteRegistration);

module.exports = router;
