const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require('../../controllers/auth/AuthController');

const validator = require('../../helpers/validator');




// post device information
router.get("/secure-admin", authController.getLogin);
router.post("/login", validator.validateLogin, authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/transaction-status", authController.hubtelReturnUrl);
router.get("/transaction-cancelled", authController.hubtelCancellationUrl);


module.exports = router;
