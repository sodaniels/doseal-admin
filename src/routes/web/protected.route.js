const path = require("path");

const express = require("express");

const router = express.Router();

const webController = require("../../controllers/web/webController");

const isTokenExist = require("../../Middleware/is-token-exist");

const validator = require("../../helpers/validator-processor");

// ecg search
router.get("/service-search", isTokenExist, webController.getServiceSearch);
// psot search-service
router.post(
	"/search-account",
	isTokenExist,
	validator.validateAccountSearch,
	webController.postServiceSearch
);
// post initiate transaction
router.post(
	"/transaction-init",
	isTokenExist,
	validator.validateTransaction,
	webController.postTransactionInitiate
);
// post execute transaction
router.post(
	"/transaction-exec",
	isTokenExist,
	webController.postTransactionExecute
);

// airtime and bundle
router.get("/airtime-and-bundle", isTokenExist, webController.getAirtime);
// dstv and others
router.get(
	"/search-utility-service",
	isTokenExist,
	webController.getSearchUtilityService
);
// dstv and others
router.post(
	"/search-utility-account",
	isTokenExist,
	validator.validateUtilitySearch,
	webController.postUtilityServiceSearch
);
// get ghana water
router.get("/ghana-water", isTokenExist, webController.getGhanaWater);
// post search ghana water
router.post(
	"/search-ghana-water",
	isTokenExist,
	validator.validateGhaaWaterSearch,
	webController.postSearchGhanaWater
);

module.exports = router;
