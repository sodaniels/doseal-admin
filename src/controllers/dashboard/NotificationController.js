const User = require("../../models/user");
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
	const admin = req.session.admin;

	const users = await User.find({});

	const notifications = await Notification.find({}).sort({ _id: -1 });
	try {
		if (notifications) {
			return res.status(200).render("backend/notification/manage", {
				pageTitle: "Notification",
				path: "/notification/manage",
				errors: false,
				userInput: false,
				users: users,
				admin: admin,
				notifications: notifications,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: false,
			users: users,
			admin: admin,
			errorMessage: false,
			successMessage: true,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			userInput: false,
			users: users,
			admin: admin,
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

async function AddItem(req, res) {
	const errorMessage = req.query.errorMessage;
	const successMessage = req.query.successMessage;
	const admin = req.session.admin;
	try {
		if (helps) {
			return res.status(200).render("backend/notification/add", {
				pageTitle: "Notification",
				path: "/notification/add",
				errors: false,
				userInput: false,
				admin: admin,
				notifications: false,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("backend/notification/add", {
			pageTitle: "Notification",
			path: "/notification/add",
			errors: false,
			userInput: false,
			admin: admin,
			notifications: false,
			errorMessage: errorMessage ? errorMessage : false,
			successMessage: successMessage ? successMessage : false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/notification/add", {
			pageTitle: "Notification",
			path: "/notification/add",
			errors: false,
			userInput: false,
			admin: admin,
			notifications: false,
			errorMessage: errorMessage ? errorMessage : false,
			successMessage: successMessage ? successMessage : false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}
}

async function postAddItem(req, res) {
	let notificationObject, savedNotification;

	const users = await User.find({});
	const notifications = await Notification.find({}).sort({ _id: -1 });
	const errors = validationResult(req);
	const requestBody = req.body;
	const admin = req.session.admin;


	

	if (!errors.isEmpty()) {
		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Manage Help Desk",
			path: "/notification/manage",
			errors: errors.array(),
			userInput: requestBody,
			users: users,
			errorMessage: false,
			admin: admin,
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}

	if((!req.body.sendToAll && req.body.sendToAll !== undefined) && !req.body.user) {
		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Manage Help Desk",
			path: "/notification/manage",
			errors: errors.array(),
			users: users,
			userInput: requestBody,
			admin: admin,
			errorMessage: "Please choose a user to send the notification ofr select 'Send to All'",
			successMessage: false,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}

	try {

		if(req.body.hasOwnProperty("sendToAll")){
			notificationObject = new Notification({
				title: req.body.title,
				excerpt: req.body.excerpt,
				message: req.body.message,
				sendToAll: true,
				createdBy: admin._id,
			});

			// process push notifications for all
			
		} else {
			notificationObject = new Notification({
				title: req.body.title,
				excerpt: req.body.excerpt,
				message: req.body.message,
				sendToAll: false,
				receivedBy: req.body.user,
				createdBy: admin._id,
			});

			// process push notifications for user
		}
		

		savedNotification = await notificationObject.save();

		if (savedNotification) {
			const notifications = await Notification.find({}).sort({ _id: -1 });
			return res.status(200).render("backend/notification/manage", {
				pageTitle: "Notification",
				path: "/notification/manage",
				errors: false,
				users: users,
				userInput: requestBody,
				admin: admin,
				errorMessage: false,
				successMessage: "Notification saved successfully",
				notifications: notifications,
				csrfToken: req.csrfToken(),
				truncateText: helper.truncateText,
				shortData: shortData,
			});
		}

		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			users: users,
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			admin: admin,
			notifications: notifications,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/notification/manage", {
			pageTitle: "Notification",
			path: "/notification/manage",
			errors: false,
			users: users,
			userInput: requestBody,
			errorMessage: error,
			successMessage: false,
			admin: admin,
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
	AddItem,
};
