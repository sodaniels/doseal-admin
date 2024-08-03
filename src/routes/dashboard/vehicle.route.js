const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require('../../helpers/validator');

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const vehicleController = require('../../controllers/dashboard/VehicleController');



// list vehicles
router.get("/vehicles", isAuth, isSuperUser, vehicleController.listVehicles);
// // get add vehicle
router.get("/vehicle/add", isAuth, isSuperUser, vehicleController.getAddVehicle);
// post add vehicle
router.post("/vehicle/add", isAuth, validator.validateVehicle, vehicleController.postAddVehicle);
// // get edit driver
router.get("/vehicle/edit/:id", isAuth, isSuperUser, vehicleController.getEditVehicle);
// post edit vehicle to db
router.post("/vehicle/edit/:id", isAuth, isSuperUser, validator.validateVehicle, vehicleController.putEditVehicle);
// get delete vehicle
router.get("/vehicle/delete/:id", isAuth, isSuperUser, vehicleController.postDeleteVehicle);

/**assignment */
// get assignments
router.get("/vehicle/assignments", isAuth, isSuperUser, vehicleController.vehicleAssignment);
// post vehicle assignment
router.post("/vehicle/assignments", isAuth, isSuperUser, validator.validateAssigment, vehicleController.postVehicleAssignment);

module.exports = router;
