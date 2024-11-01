const express = require("express");

const router = express.Router();

const externalApiController = require("../../controllers/v1/ExternalApiController");
const validator = require("../../helpers/validator-api");

// hubtel msisdn query
router.post(
	"/msisdn-query",
	validator.validatePhoneRequest,
	externalApiController.postMSISDNquery
);

router.post("/validate-identity", externalApiController.postValidateIDCard);
module.exports = router;
