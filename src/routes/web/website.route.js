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
// get contact
router.get("/contact-us", webController.contactUsService);


module.exports = router;
