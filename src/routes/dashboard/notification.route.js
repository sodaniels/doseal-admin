const path = require("path");
const express = require("express");

const router = express.Router();

const validator = require("../../helpers/validator");

const viewNotification = require("../../Middleware/view-notifications");

const notificationController = require("../../controllers/dashboard/NotificationController");

router.use(viewNotification)

// list notifications
router.get(
	"/notification/manage",
	viewNotification,
	notificationController.listItem
);
// get add expense
router.post(
	"/notification/add",
	viewNotification,
	notificationController.postAddItem
);

module.exports = router;
