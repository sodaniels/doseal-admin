const express = require("express");

const router = express.Router();

const apiController = require("../../controllers/v1/ApiController");
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

module.exports = router;
