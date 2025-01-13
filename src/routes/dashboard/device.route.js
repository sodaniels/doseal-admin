const path = require("path");
const express = require("express");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const deviceController = require('../../controllers/dashboard/DeviceController');


// scheduling list
router.get("/devices", isAuth, isSuperUser, deviceController.getDevices);
// downloads
router.get("/downloads", isAuth, isSuperUser, deviceController.getDownloadsPage);


module.exports = router;
