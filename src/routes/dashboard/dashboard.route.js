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

router.get("/seeder", isAuth, isSuperUser, seederController.seeder);

router.get("/dashboard1", isAuth, dashboardController.getIndex1); // remove

// dashboard
router.get("/", isAuth, dashboardController.getIndex);
router.get("/dashboard", isAuth, dashboardController.getIndex);

/** Business */
// list business
router.get("/businesses", isAuth, isSuperUser, businessController.listBusiness);
// get Business page
router.get("/business/add", isAuth, isSuperUser, businessController.getAddBusiness);
// post Business to db
router.post("/business/add", isAuth, isSuperUser, validator.validateCustomer, businessApiController.postBusiness);
// post edit Business to db
router.get("/business/edit/:businessId", isAuth, isSuperUser, businessController.getEditBusiness);
// post edit Business to db
router.post("/business/edit/:businessId", isAuth, isSuperUser, businessController.putEditBusiness);
// delete Business
router.get("/business/delete/:businessId", isAuth, isSuperUser, businessController.deleteBusiness);
/** Business */

/**Transactions */
// get transactions
router.get("/transactions", isAuth, transactionController.getTransactions);

module.exports = router;
