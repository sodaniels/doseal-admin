const express = require("express");

const router = express.Router();

const apiController = require("../../controllers/v1/ApiController");
const validator = require("../../helpers/validator");

// get information
router.get("/pages/:pageCategory", apiController.getPageCategory);
// post topup wallet
router.post("/topup-wallet", apiController.postTopUpWallet);

module.exports = router;
