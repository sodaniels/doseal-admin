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
// post initiate transaction
router.post(
	"/transaction-init",
	validator.validateTransaction,
	webController.postTransactionInitiate
);
// post execute transaction
router.post("/transaction-exec", webController.postTransactionExecute);

module.exports = router;
