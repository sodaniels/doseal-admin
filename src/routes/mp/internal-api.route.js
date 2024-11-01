const express = require("express");

const router = express.Router();

const internalApiController = require("../../controllers/v1/InternalApiController");
const validator = require("../../helpers/validator-api");

// get information
router.get("/news", internalApiController.getNews);

module.exports = router;
