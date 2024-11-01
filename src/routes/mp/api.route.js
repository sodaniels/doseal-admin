const express = require("express");

const router = express.Router();

const apiController = require("../../controllers/v1/ApiController");
const hubtelController = require("../../controllers/v1/HubtelController");
const validator = require("../../helpers/validator-api");


// post topup wallet
router.post(
	"/topup-wallet",
	validator.validateWalletTopup,
	apiController.postTopUpWallet
);
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
// post transaction execute
router.post(
	"/transaction/initiate",
	validator.validateTransaction,
	apiController.postTransactionInitiate
);
router.post(
	"/transaction/execute",
	validator.validateTransaction,
	apiController.postTransactionExecute
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
// hubtel airtime topup
router.post(
	"/hubtel-airtime-topup",
	hubtelController.HubtelAirtimeTopupRequest
);
// hubtel ecg meter search
router.post(
	"/search-ecg-meter",
	validator.validateEcgSearch,
	apiController.postHubtelEcgMeterSearch
);
// hubtel payment checkout
router.post("/hubtel-payment-checkout", hubtelController.HubtelPaymentCheckout);
// hubtel dstv search
router.post(
	"/search-dstv-account",
	validator.validateUtilitySearch,
	apiController.postHubtelDstvAccountSearch
);
// hubtel goTV search
router.post(
	"/search-gotv-account",
	validator.validateUtilitySearch,
	apiController.postHubtelGoTVAccountSearch
);
// hubtel start time tv account search
router.post(
	"/search-star-times-tv-account",
	validator.validateUtilitySearch,
	apiController.postHubtelStarTimesTvAccountSearch
);
// hubtel ghana water account search
router.post(
	"/search-ghana-water-account",
	validator.validateUtilitySearch,
	apiController.postHubtelGhanaWaterAccountSearch
);
// get stored ecg meters
router.get("/stored-ecg-meters", apiController.getStoredECGMeters);
// post report issue
router.post(
	"/report-issues",
	validator.validateIssueReport,
	apiController.postReportedIssue
);
// get reported issues
router.get("/report-issues", apiController.getReportedIssues);
//post feedback
router.post(
	"/feedbacks",
	validator.validateFeedback,
	apiController.postFeedback
);
// get feedbacks
router.get("/feedbacks", apiController.getFeedback);
// search mtn bundle
router.post(
	"/search-data-bundle-by-network",
	validator.validateDataBundleSearch,
	apiController.postSearchDataBundleByNetwork
);
// get transaction status check
router.get(
	"/transaction-status-check",
	apiController.getTransactionStatusCheck
);
// get balance query
router.get("/pos-balance-query", apiController.getPOSBalanceQuery);
// get prepaid balance query
router.get("/prepaid-balance-query", apiController.getPrepaidBalanceQuery);
// post balance transfer
router.post("/transfer-balance", apiController.postTransferBalance);
// get help desk
router.get("/help-desk", apiController.getHelpDesk);
// post report a fault
router.post(
	"/report-fault",
	validator.validateReportFault,
	apiController.postReportFault
);

module.exports = router;
