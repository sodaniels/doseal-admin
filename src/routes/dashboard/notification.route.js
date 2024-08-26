const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator");

const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");

const helpDeskController = require("../../controllers/dashboard/HelpDeskController");

// list notifications
router.get(
	"/notification/manage",
	isAuth,
	isSuperUser,
	helpDeskController.listItem
);
// get add expense
router.post(
	"/notification/add",
	isAuth,
	isSuperUser,
	helpDeskController.postAddHelpDesk
);
// // get edit expense
router.get(
	"/notification/edit/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.getEditHelpDesk
);
// // post edit expense to db
router.post(
	"/notification/edit/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.putEditHelpDesk
);
// // get delete expense
router.get(
	"/notification/delete/:_id",
	isAuth,
	isSuperUser,
	helpDeskController.getDeleteHelpDesk
);

module.exports = router;
