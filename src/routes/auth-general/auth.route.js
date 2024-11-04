const path = require("path");

const express = require("express");

const router = express.Router();

const authGeneralController = require("../../controllers/auth/AuthGeneralController");

const validator = require("../../helpers/validator-auth");

// get login gen4 login
router.get("/login/:token", authGeneralController.getLogin);
// post gen4 login
router.post(
	"/gen4-login",
	validator.validateGen4Login,
	authGeneralController.postLogin
);
// confirm gen4 code
router.get("/confirm-code/:token", authGeneralController.getConfirmCode);
router.post("/logout", authGeneralController.postLogout);

module.exports = router;
