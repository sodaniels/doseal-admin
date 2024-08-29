const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator");

const isAuth = require("../../Middleware/is-auth");
const isSuperUser = require("../../Middleware/is-superUser");

const notificationController = require("../../controllers/dashboard/NotificationController");

// list notifications
router.get(
	"/notification/manage",
	isAuth,
	isSuperUser,
	notificationController.listItem
);
// get add expense
router.post(
	"/notification/add",
	isAuth,
	isSuperUser,
	notificationController.postAddItem
);

module.exports = router;
