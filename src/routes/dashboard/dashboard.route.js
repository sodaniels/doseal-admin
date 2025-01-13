const path = require("path");

const express = require("express");

const router = express.Router();

const isAuth = require('../../Middleware/is-auth');
const isSuperUser = require('../../Middleware/is-superUser');

const dashboardController = require('../../controllers/dashboard/DashboardController');
const businessController = require('../../controllers/dashboard/BusinessController')
const businessApiController = require('../../controllers/dashboard/BusinessApiController');

const transactionController = require('../../controllers/dashboard/TransactionController');

const seederController = require('../../controllers/auth/seederController')

const validator = require('../../helpers/validator');

const viewDashboard = require("../../Middleware/view-dashboard");

router.use(viewDashboard);

router.get("/seeder", seederController.seeder);

router.get("/dashboard1",  dashboardController.getIndex1); // remove

// dashboard
router.get("/", dashboardController.getIndex);
router.get("/dashboard",dashboardController.getIndex);

/** Business */
// list business
router.get("/businesses", businessController.listBusiness);
// get Business page
router.get("/business/add",businessController.getAddBusiness);
// post Business to db
router.post("/business/add", validator.validateCustomer, businessApiController.postBusiness);
// post edit Business to db
router.get("/business/edit/:businessId", businessController.getEditBusiness);
// post edit Business to db
router.post("/business/edit/:businessId", businessController.putEditBusiness);
// delete Business
router.get("/business/delete/:businessId", businessController.deleteBusiness);
/** Business */

module.exports = router;
