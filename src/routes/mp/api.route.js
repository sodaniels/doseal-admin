const express = require("express");

const router = express.Router();

const apiController = require("../../controllers/v1/ApiController");
const hubtelController = require("../../controllers/v1/HubtelController");
const validator = require("../../helpers/validator-api");

// get information
router.get("/pages/:pageCategory", apiController.getPageCategory);
// post topup wallet
router.post("/topup-wallet", apiController.postTopUpWallet);
// get topup wallet
router.get("/topup-wallets", apiController.getTopUpWallets);
// get profile  information
router.get("/profile", apiController.getProfile);
// put update profile
router.put(
	"/profile",
	validator.validateProfile,
	apiController.putUpdateProfile
);
// post add wallet information
router.post("/wallet", validator.validateWallet, apiController.postWallet);
// get wallets
router.get("/wallet", apiController.getWallets);
// post buy credit
router.post(
	"/buy-credit",
	validator.validateBuyCredit,
	apiController.postBuyCredit
);

router.get("/transactions-excerpt", apiController.getExcerptTransactions);
// get transactions
router.get("/transactions", apiController.getTransactions);

/*HUBTEL API ENDPOINTS */
router.post(
	"/account-validation",
	validator.validateAccount,
	hubtelController.AccountValidation
);

router.post(
	"/prepaid-postpaid-request",
	validator.validateAccount,
	hubtelController.PrepaidPostpaidRequest
);

router.post("/hubtel-airtime-topup", hubtelController.HubtelMTNRequest);

module.exports = router;
