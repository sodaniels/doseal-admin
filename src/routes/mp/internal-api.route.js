const express = require("express");

const router = express.Router();

const internalApiController = require("../../controllers/v1/InternalApiController");
const validator = require("../../helpers/validator-api");

// get information
router.get("/news", internalApiController.getNews);
// get notifications
router.get("/notifications", internalApiController.getNotifications);
//
router.post("/add-electricity", internalApiController.postAddElectricity);

module.exports = router;
