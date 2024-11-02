const path = require("path");

const express = require("express");

const router = express.Router();

const webController = require("../../controllers/web/webController");

const validator = require("../../helpers/validator-processor");

// ecg search
router.get("/service-search", webController.getServiceSearch);
// psot search-service
router.post(
	"/search-account",
	validator.validateAccountSearch,
	webController.postServiceSearch
);
// post process ecg
router.post(
	"/transaction-init",
	validator.validateTransaction,
	webController.postTransactionInitiate
);

module.exports = router;
