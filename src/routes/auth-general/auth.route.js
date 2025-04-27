const path = require("path");

const express = require("express");

const router = express.Router();

const authGeneralController = require("../../controllers/auth/AuthGeneralController");
// const { loginRateLimiterMiddleware } = require('../../Middleware/loginRateLimiterMiddleware');


const validator = require("../../helpers/validator-auth");

// get login gen4 login
router.get("/auth/login",  authGeneralController.getLogin);
// get mobile login redirect page
router.get("/auth/mobile/redirect", authGeneralController.getMobileRedirect);
// post gen4 login
router.post(
	"/authentate/login",
	validator.validateGen4Login,
	authGeneralController.postLogin
);
// confirm gen4 code
router.get("/gen4/confirm-code", authGeneralController.getConfirmCode);
// post confirmation code
router.post("/gen4/confirm-code", authGeneralController.postConfirmCode);
// post logout
router.post("/logout", authGeneralController.postLogout);

module.exports = router;
