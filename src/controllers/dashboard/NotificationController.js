const Notification = require("../../models/notification.model");
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require("../../helpers/shortData");
const { rand10Id, randId } = require("../../helpers/randId");
const Helper = require("../../helpers/helper");
const helper = new Helper();
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

async function listItem(req, res) {
	const errorMessage = req.query.errorMessage;
	const successMessage = req.query.successMessage;

	const notifications = await Notification.find({}).sort({ _id: -1 });
	try {
		if (notifications) {
			return res.status(200).render("admin/notification/manage", {
				pageTitle: "Notification",
				path: "/notification/manage",
				errors: false,
				userInput: false,
				notifications: notifications,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("admin/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: false,
			errorMessage: false,
			successMessage: true,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("admin/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: false,
			errorMessage: error,
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}
}

async function postAddItem(req, res) {
	const notifications = await Notification.find({}).sort({ _id: -1 });
	const errors = validationResult(req);
	const requestBody = req.body;
	const admin = req.session.user;

	if (!errors.isEmpty()) {
		return res.status(200).render("admin/notification/manage", {
			pageTitle: "Manage Help Desk",
			path: "/notification/manage",
			errors: errors.array(),
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}

	try {
		const notificationHelp = new Notification({
			title: req.body.title,
			message: req.body.message,
			createdBy: admin._id,
		});

		const savedNotification = await notificationHelp.save();

		if (savedNotification) {
			const notifications = await Notification.find({}).sort({ _id: -1 });
			return res.status(200).render("admin/notification/manage", {
				pageTitle: "Notification",
				path: "/notification/manage",
				errors: false,
				userInput: requestBody,
				errorMessage: false,
				successMessage: "Notification saved successfully",
				notifications: notifications,
				csrfToken: req.csrfToken(),
				truncateText: helper.truncateText,
				shortData: shortData,
			});
		}

		return res.status(200).render("admin/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("admin/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: error,
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}
}

module.exports = {
	listItem,
	postAddItem,
};
