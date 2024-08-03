const express = require("express");

const router = express.Router();

const authApiController = require('../../controllers/v1/auth/AuthApiController');

/**Auth */
// store device information
router.post("/device/information/store", authApiController.postDeviceData);
// send code to user phone  
router.post("/send-code", authApiController.sendCode);
// confirm code
router.post("/confirm-code", authApiController.confirmCode);
// do Login
router.post("/login", authApiController.doLogin);
// complete registration
router.post("/complete-registration", authApiController.completeRegistration);
/**Auth */




module.exports = router;
