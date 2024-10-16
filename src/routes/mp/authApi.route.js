const express = require("express");

const router = express.Router();

const authApiController = require("../../controllers/v1/auth/AuthApiController");

/**Auth */
// store device information
router.post("/device/information/store", authApiController.postDeviceData);
// check account status
router.post("/account-status", authApiController.postCheckAccountStatus);
// do biometric login
router.post("/process-biometric-login", authApiController.postDoBioMetricLogin);
// send code to user phone
router.post("/send-code", authApiController.sendCode);
// confirm code
router.post("/confirm-code", authApiController.confirmCode);
// do Login
router.post("/login", authApiController.doLogin);
// complete registration
router.post("/complete-registration", authApiController.completeRegistration);
// get information
router.get("/pages/:pageCategory", authApiController.getPageCategory);
/**Auth */

module.exports = router;
