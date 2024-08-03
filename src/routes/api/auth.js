const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require("../../controllers/auth/AuthController");
const seederController = require("../../controllers/auth/seederController");
const validator = require("../../helpers/validator");

// post device information
router.post(
	"/device/information/store",
	validator.validatePostDevice,
	authController.postDeviceData
);
//get tenants
router.get("/tenants", authController.postDeviceData);
// seeder
router.get("/seeder", seederController.seeder);

// initialize registration
router.post(
	"/intialize-registration",
	validator.validateInitRegistration,
	authController.intializeRegistration
);
// verify otp
router.post(
	"/verify-otp",
	validator.validateVerifyOtp,
	authController.verifyOtp
);
// complete registration
router.post(
	"/complete-registration",
	validator.validateCompleteRegistration,
	authController.completeRegistration
);
//login users
router.post("/login", authController.postLogin);

module.exports = router;
