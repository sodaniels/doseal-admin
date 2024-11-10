const path = require("path");

const express = require("express");

const router = express.Router();

const subscriberController = require("../../controllers/whatsapp/subscriberController");
const validator = require("../../helpers/validator");

router.post("/subscriber/registration", subscriberController.postSubscriber);
router.get("/account-kyc/:phoneNumber", subscriberController.getAccountKyc);
router.get(
	"/account-status/:phoneNumber",
	subscriberController.getAccountStatus
);
router.post("/request", subscriberController.postRequest);
router.get("/requests", subscriberController.getRequests);
router.post("/edit-profile", subscriberController.postEditProfile);
router.post("/send-otp", subscriberController.postSendOTP);
router.post("/confirm-otp", subscriberController.confirmOTP);
router.post("/store-name", subscriberController.postName);
router.post("/confirm-code", subscriberController.confirmCode);

router.post("/GH/validate-pin", subscriberController.postValidatePin);
router.post("/GH/balance-with-pin", subscriberController.getAccountBalance);
router.post("/GH/change-pin", subscriberController.postChangePin);

module.exports = router;
