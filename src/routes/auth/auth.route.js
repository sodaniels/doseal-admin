const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require("../../controllers/web/AuthController");

const validator = require("../../helpers/validator-processor");

//initial signup
router.get("/signup", authController.getRegistrationPage);
router.post(
	"/initial-signup",
	validator.validateInitialSignup,
	authController.postInitialSignup
);

router.get("/verify-account", authController.getVerifyAccount);
// verify code
router.post("/verify-account", authController.postVerifyAccount);
// complete registration
router.get("/complete-registration", authController.getCompleteRegistration);

module.exports = router;
