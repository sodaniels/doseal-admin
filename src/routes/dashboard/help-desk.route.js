const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator-processor");

const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");

const helpDeskController = require("../../controllers/dashboard/HelpDeskController");

// list expenses
router.get(
	"/help-desk/manage",
	isAuth,
	isSuperUser,
	helpDeskController.listItem
);
router.get(
	"/help-desk/add",
	isAuth,
	isSuperUser,
	helpDeskController.AddItem
);
// get add expense
router.post(
	"/help-desk/add",
	isAuth,
	isSuperUser,
	validator.validateHelpDesk,
	helpDeskController.postAddHelpDesk
);
// // get edit expense
router.get(
	"/help-desk/edit/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.getEditHelpDesk
);
// // post edit expense to db
router.post(
	"/help-desk/edit/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.putEditHelpDesk
);
// // get delete expense
router.get(
	"/help-desk/delete/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.getDeleteHelpDesk
);

module.exports = router;
