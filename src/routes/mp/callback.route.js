const path = require("path");

const express = require("express");

const router = express.Router();

const callBackController = require("../../controllers/v1/CallbackController");


// post wallet topup callback
router.post(
	"/wallet-topup-callback",
	callBackController.postWalletTopupCallback
);
// post transaction callback
router.post(
	"/transaction-callback",
	callBackController.postTransactionCallback
);
// post hubtel airtime callback
router.post(
	"/hubtel-airtime-callback",
	callBackController.postHubtelAirtimeTopup
);
// post hubtel payment callback
router.post(
	"/hubtel-payment-callback",
	callBackController.postHubtelPaymentCallback
);
// post utility services callback
router.post(
	"/hubtel-utility-services-callback",
	callBackController.postHubtelUtilityCallbackServices
);
// post balance transfer callback
router.post(
	"/hubtel-balance-transfer-callback",
	callBackController.postHubtelTransferBalanceCallback
);



module.exports = router;
