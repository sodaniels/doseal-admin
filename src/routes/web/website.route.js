const path = require("path");

const express = require("express");

const router = express.Router();

const webController = require('../../controllers/web/webController');

const validator = require('../../helpers/validator');


// post device information
router.get("/", webController.getIndex);
// about us page
router.get("/about-us", webController.agentAboutUs);
// services
router.get("/our-services", webController.agentOurServices);


module.exports = router;
