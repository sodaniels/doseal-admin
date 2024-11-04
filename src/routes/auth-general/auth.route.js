const path = require("path");

const express = require("express");

const router = express.Router();

const authGeneralController = require("../../controllers/auth/AuthGeneralController");

const validator = require("../../helpers/validator-auth");

// post device information
router.get("/login/:token", authGeneralController.getLogin);
router.post("/gen4-login", validator.validateGen4Login, authGeneralController.postLogin);
router.post("/logout", authGeneralController.postLogout);

module.exports = router;
