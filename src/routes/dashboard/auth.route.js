const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require('../../controllers/auth/AuthController');

const validator = require('../../helpers/validator');


// post device information
router.get("/login", authController.getLogin);
router.post("/login", validator.validateLogin, authController.postLogin);
router.post("/logout", authController.postLogout);


module.exports = router;
