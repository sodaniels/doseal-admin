const path = require("path");
const express = require("express");

const router = express.Router();

const deviceController = require('../../controllers/dashboard/DeviceController');
const viewDevices = require("../../Middleware/view-devices");

router.use(viewDevices);
// scheduling list
router.get("/devices", deviceController.getDevices);
// downloads
router.get("/downloads", deviceController.getDownloadsPage);


module.exports = router;
