const path = require("path");

const express = require("express");

const router = express.Router();

const callBackController = require('../../controllers/v1/CallbackController');

// post wallet topup callback
router.post("/wallet-topup-callback", callBackController.postWalletTopupCallback);


module.exports = router;
