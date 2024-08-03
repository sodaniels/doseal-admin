const express = require("express");

const router = express.Router();

const ecgController = require('../../controllers/v1/auth/EcgController');
const validator = require('../../helpers/validator');

router.post("/check-ecg-status", ecgController.makeHubtelEcgRequest);




module.exports = router;


