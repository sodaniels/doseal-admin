const express = require("express");

const router = express.Router();

const internalApiController = require("../../controllers/v1/InternalApiController");
const validator = require("../../helpers/validator-api");

// get information
router.get("/news", internalApiController.getNews);
// get notifications
router.get("/notifications", internalApiController.getNotifications);
// post electricity information
router.post(
	"/electricity",
	validator.validateElectricity,
	internalApiController.postAddElectricity
);
// get electricity information
router.get("/electricity", internalApiController.getElectricity);
// post airimte validation
router.post("/airtime", internalApiController.postAirtimeValidation);
// get airtime
router.get("/airtime", internalApiController.getAirtime);
// get data
router.get("/data", internalApiController.getData);
// get tv-stream
router.get("/tv-streams", internalApiController.getTvStreams);
// get ghana water
router.get("/ghana-water", internalApiController.getGhanaWater);

module.exports = router;
