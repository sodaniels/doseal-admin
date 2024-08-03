const path = require("path");
const express = require("express");
const router = express.Router();

const validator = require("../../helpers/validator");

const internalApiController = require("../../controllers/Internal/InternalApiController");

// get countries
router.get("/countries", internalApiController.getCountries);
// get rates
router.get("/rates", internalApiController.getRates);
// post beneficiary data
router.post("/beneficiaries/abroad", validator.validateBeneficiaryData, internalApiController.postBeneficiaryData);

module.exports = router;
