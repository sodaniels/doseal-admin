const path = require("path");

const express = require("express");

const router = express.Router();

const callBackController = require("../../controllers/v1/CallbackController");

const isWhitelisted = require("../../Middleware/is-whitelisted-IP");

// post wallet topup callback
router.post(
	"/wallet-topup-callback",
	isWhitelisted,
	callBackController.postWalletTopupCallback
);
// post transaction callback
router.post(
	"/transaction-callback",
	isWhitelisted,
	callBackController.postTransactionCallback
);
// post hubtel airtime callback
router.post(
	"/hubtel-airtime-callback",
	isWhitelisted,
	callBackController.postHubtelAirtimeTopup
);
// post hubtel payment callback
router.post(
	"/hubtel-payment-callback",
	isWhitelisted,
	callBackController.postHubtelPaymentCallback
);
// post utility services callback
router.post(
	"/hubtel-utility-services-callback",
	isWhitelisted,
	callBackController.postHubtelUtilityCallbackServices
);
// post balance transfer callback
router.post(
	"/hubtel-balance-transfer-callback",
	isWhitelisted,
	callBackController.postHubtelTransferBalanceCallback
);

module.exports = router;
