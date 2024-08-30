const Help = require("../../models/help.model");
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require("../../helpers/shortData");
const { rand10Id, randId } = require("../../helpers/randId");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Helper = require("../../helpers/helper");
const helper = new Helper();

const { handleValidationErrors } = require("../../helpers/validationHelper");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");

async function listItem(req, res) {
	const errorMessage = req.query.errorMessage;
	const successMessage = req.query.successMessage;

	const helps = await Help.find({}).sort({ _id: -1 });
	try {
		if (helps) {
			return res.status(200).render("backend/help-desk/manage", {
				pageTitle: "Manage Help Desk",
				path: "/help-desk/manage",
				errors: false,
				userInput: false,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				helps: helps,
				help: false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("backend/help-desk/manage", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/manage",
			errors: false,
			userInput: false,
			errorMessage: false,
			successMessage: true,
			helps: helps,
			help: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/help-desk/manage", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/manage",
			errors: false,
			userInput: false,
			errorMessage: error,
			helps: helps,
			help: false,
			successMessage: false,
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

	const helps = await Help.find({}).sort({ _id: -1 });
	try {
		if (helps) {
			return res.status(200).render("backend/help-desk/add", {
				pageTitle: "Manage Help Desk",
				path: "/help-desk/add",
				errors: false,
				userInput: false,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				helps: helps,
				help: false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("backend/help-desk/add", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/add",
			errors: false,
			userInput: false,
			errorMessage: false,
			successMessage: true,
			helps: helps,
			help: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/help-desk/add", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/add",
			errors: false,
			userInput: false,
			errorMessage: error,
			helps: helps,
			help: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}
}

async function postAddHelpDesk(req, res) {
	const helps = await Help.find({}).sort({ _id: -1 });
	const errors = validationResult(req);
	const requestBody = req.body;
	const admin = req.session.user;

	if (!errors.isEmpty()) {
		return res.status(200).render("backend/help-desk/manage", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/manage",
			errors: errors.array(),
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			helps: helps,
			help: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}

	try {
		const newHelp = new Help({
			title: req.body.title,
			category: req.body.category,
			content: req.body.content,
			createdBy: admin._id,
		});

		const savedHelp = await newHelp.save();

		if (savedHelp) {
			const helps = await Help.find({}).sort({ _id: -1 });
			return res.status(200).render("backend/help-desk/manage", {
				pageTitle: "Manage Help Desk",
				path: "/help-desk/manage",
				errors: false,
				userInput: requestBody,
				errorMessage: false,
				successMessage: "Help Desk saved successfully",
				helps: helps,
				help: false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				truncateText: helper.truncateText,
			});
		}

		return res.status(200).render("backend/help-desk/manage", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			helps: helps,
			help: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/help-desk/manage", {
			pageTitle: "Manage Help Desk",
			path: "/help-desk/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: error,
			successMessage: false,
			helps: helps,
			help: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helper.truncateText,
		});
	}
}

async function getEditHelpDesk(req, res) {
	const _id = req.params._id;
	try {
		const help = await Help.findOne({ _id: _id });
		const helps = await Help.find({}).sort({ _id: -1 });

		if (help) {
			return res.status(200).render("admin/help-desk/edit", {
				pageTitle: "Edit Help",
				path: "/help-desk/edit/" + _id,
				errors: false,
				userInput: false,
				help: help,
				helps: helps,
				errorMessage: false,
				successMessage: false,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
			});
		} else {
			return res.status(200).render("admin/help-desk/edit", {
				pageTitle: "Edit Help",
				path: "/help-desk/edit/" + _id,
				errors: false,
				userInput: false,
				errorMessage: false,
				successMessage: true,
				help: help,
				helps: helps,
				csrfToken: req.csrfToken(),
				shortData: shortData,
				cuteDate: cuteDate,
			});
		}
	} catch (error) {
		return res.status(200).render("admin/help-desk/edit", {
			pageTitle: "Edit Help",
			errors: false,
			userInput: false,
			errorMessage: error,
			help: false,
			helps: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function putEditHelpDesk(req, res) {
	const requestBody = req.body;
	const _id = req.params._id;
	const helps = await Help.find({}).sort({ _id: -1 });
	const help = await Help.findOne({ _id: req.params._id });
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(200).render("admin/help-desk/edit", {
			pageTitle: "Edit Help Desk",
			path: "/help-desk/edit/" + _id,
			errors: false,
			userInput: requestBody,
			help: help,
			helps: helps,
			errorMessage: false,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}

	try {
		const updatedExpenseData = {
			title: req.body.title,
			amount: req.body.amount,
			date: req.body.date,
			note: req.body.note,
		};

		Help.findOne({ _id: req.params._id })
			.then((expense) => {
				if (expense) {
					// Update the expense with the new data
					Object.assign(expense, updatedExpenseData);
					// Save the changes to the database
					return expense.save();
				} else {
					// Handle the case where the expense with the specified ID is not found
					return res.redirect(
						"/help-desk/manage?errorMessage=Help Desk could not be found"
					);
				}
			})
			.then(async (updatedExpense) => {
				// Handle the case where the update was successful
				return res.redirect(
					"/help-desk/manage?successMessage=Help Desk updated successfully"
				);
			})
			.catch((error) => {
				// Handle any errors that occurred during the update process
				return res.status(422).render("admin/help-desk/edit", {
					pageTitle: "Edit Help Desk",
					path: "/help-desk/edit/" + _id,
					errors: false,
					userInput: false,
					help: help,
					helps: helps,
					errorMessage: error,
					successMessage: false,
					csrfToken: req.csrfToken(),
					shortData: shortData,
					cuteDate: cuteDate,
				});
			});
	} catch (error) {
		return res.status(422).render("admin/help-desk/edit", {
			pageTitle: "Edit Help Desk",
			path: "/help-desk/edit/" + _id,
			errors: false,
			userInput: false,
			help: help,
			helps: helps,
			errorMessage: error,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function getDeleteHelpDesk(req, res) {
	try {
		const _id = req.params._id;
		const expense = await Help.findOneAndDelete({ _id: _id });
		if (expense) {
			return res.redirect(
				"/help-desk/manage?successMessage=Help Desk deleted successfully"
			);
		} else {
			return res.redirect(
				"/help-desk/manage?errorMessage=Could not delete help desk"
			);
		}
	} catch (error) {
		const expenses = await Help.find({}).sort({ _id: -1 });
		return res.status(422).render("admin/help-desk/manage", {
			pageTitle: "Edit Help Desk",
			path: "/help-desk/edit/" + _id,
			errors: false,
			userInput: false,
			expense: false,
			expenses: expenses,
			errorMessage: error,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

module.exports = {
	listItem,
	postAddHelpDesk,
	getEditHelpDesk,
	putEditHelpDesk,
	getDeleteHelpDesk,
	AddItem,
};
