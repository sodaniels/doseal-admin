const path = require("path");

const express = require("express");

const router = express.Router();

const subscriberController = require('../../controllers/v1/subscriberController');
const validator = require("../../helpers/validator");


router.post("/subscriber/registration", subscriberController.postSubscriber);
router.get("/GH/account-kyc/:msisdn", subscriberController.getAccountKyc);
router.get("/GH/account-status/:msisdn", subscriberController.getAccountStatus);
router.post("/GH/validate-pin", subscriberController.postValidatePin);
router.post("/GH/balance-with-pin", subscriberController.getAccountBalance);
router.post("/GH/change-pin", subscriberController.postChangePin);

module.exports = router;
   