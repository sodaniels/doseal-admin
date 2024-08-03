const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const vendorController = require('../../controllers/dashboard/VendorController');



// list vendor
router.get("/vendor/manage", isAuth, isSuperUser, vendorController.listVendor);
// get add vendor
router.post("/vendor/add", isAuth, isSuperUser, vendorController.postAddVendor);
// // get edit vendor
router.get("/vendor/edit/:_id", isAuth, isSuperUser, vendorController.getEditVendor);
// // post edit vendor to db
router.post("/vendor/edit/:_id", isAuth, isSuperUser, vendorController.putEditVendor);
// // get delete vendor
router.get("/vendor/delete/:_id", isAuth, isSuperUser, vendorController.getDeleteVendore);


module.exports = router;
