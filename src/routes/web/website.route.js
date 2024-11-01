const path = require("path");

const express = require("express");

const router = express.Router();

const webController = require('../../controllers/web/webController');

const validator = require('../../helpers/validator');


// post device information
router.get("/", webController.getIndex);
// about us page
router.get("/about-us", webController.getAboutUs);
// services
router.get("/our-services", webController.getOurServices);
// get contact
router.get("/contact-us", webController.getContactUs);
// post contact us
router.post("/contact-us", webController.postContacUs);
// pages
router.get("/legal/:category/:slug", webController.getPages);
// downloads link
router.get("/downloads", webController.getDownloads);
// get pay bill
router.get("/pay-bill", webController.getPayBill);
// ecg search
router.get("/service-search", webController.getServiceSearch);


module.exports = router;
