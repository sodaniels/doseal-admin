const express = require("express");

const router = express.Router();

const internalApiController = require("../../controllers/v1/InternalApiController");
const validator = require("../../helpers/validator-api");

// get information
router.get("/news", internalApiController.getNews);

router.get("/notifications", internalApiController.getNotificaitons);

module.exports = router;
