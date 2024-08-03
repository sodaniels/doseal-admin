const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const regionController = require('../../controllers/dashboard/RegionController');

const validator = require('../../helpers/validator');


// // get regions
// router.get("/regions", isAuth, isSuperUser, regionController.listRegions);
// // post user dustbin
// router.post("/region/add", isAuth, validator.validateRegion, regionController.postAddRegion);
// // get delete region
// router.get("/region/delete/:id", isAuth, isSuperUser, regionController.getDeleteRegion);



module.exports = router;
