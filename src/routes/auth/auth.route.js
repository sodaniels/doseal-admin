const path = require("path");

const express = require("express");

const router = express.Router();

const authController = require('../../controllers/web/AuthController');

const validator = require('../../helpers/validator');


// post device information
router.get("/signup", authController.getRegistrationPage);



module.exports = router;
