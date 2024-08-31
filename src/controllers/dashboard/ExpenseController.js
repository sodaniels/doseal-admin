const Expense = require("../../models/expense.model");
const GSTATS = require("../../models/GlobalStats.model");
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require("../../helpers/shortData");
const { rand10Id, randId } = require("../../helpers/randId");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();

async function listExpense(req, res) {
	const errorMessage = req.query.errorMessage;
	const successMessage = req.query.successMessage;

	const expenses = await Expense.find({}).sort({ _id: -1 });
	const globalStats = await GSTATS.GlobalStats.findOne();
	// console.log(globalStats);

	try {
		if (expenses) {
			return res.status(200).render("backend/expenses/manage", {
				pageTitle: "Manage Expenses",
				path: "/expenses/manage",
				errors: false,
				userInput: false,
				expense: false,
				globalStats: globalStats,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				expenses: expenses,
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helpers.truncateText,
			});
		}

		return res.status(200).render("backend/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: false,
			expense: false,
			userInput: false,
			errorMessage: false,
			successMessage: true,
			globalStats: globalStats,
			expenses: expenses,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: false,
			userInput: false,
			expense: false,
			globalStats: false,
			errorMessage: error,
			expenses: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}
}

async function postAddExpense(req, res) {
	const expenses = await Expense.find({}).sort({ _id: -1 });
	const globalStats = await GSTATS.GlobalStats.find({});
	const errors = validationResult(req);
	const requestBody = req.body;
	const admin = req.session.user;

	if (!errors.isEmpty()) {
		return res.status(200).render("backend/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: errors.array(),
			userInput: requestBody,
			expense: false,
			errorMessage: false,
			successMessage: false,
			globalStats: globalStats,
			expenses: expenses,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}

	try {
		const receiptFile = req.files["receipt"][0];
		const baseUrl = `${req.protocol}://${req.get("host")}`;
		const receiptFileUrl = `${baseUrl}/uploads/receipts/${receiptFile.filename}`;

		const newExpense = new Expense({
			title: req.body.title,
			amount: {
				value: req.body.amount,
				currency: req.body.currency,
			},
			date: req.body.date,
			note: req.body.note,
			receipt: receiptFileUrl ? receiptFileUrl : undefined,
			createdBy: admin._id,
		});

		// Update GlobalStats
		await GSTATS.updateGlobalStats(Number(req.body.amount), req.body.currency);

		const savedExpense = await newExpense.save();

		if (savedExpense) {
			const globalStats = await GSTATS.GlobalStats.find({});
			const expenses = await Expense.find({}).sort({ _id: -1 });
			return res.status(200).render("backend/expenses/manage", {
				pageTitle: "Manage Expenses",
				path: "/expenses/manage",
				errors: false,
				userInput: requestBody,
				expense: false,
				errorMessage: false,
				successMessage: "Expense saved successfully",
				globalStats: globalStats,
				expenses: expenses,
				shortData: shortData,
				truncateText: helpers.truncateText,
			});
		}

		return res.status(200).render("backend/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: false,
			userInput: requestBody,
			expense: false,
			errorMessage: false,
			successMessage: false,
			expenses: expenses,
			globalStats: globalStats,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: false,
			userInput: requestBody,
			expense: false,
			errorMessage: error,
			successMessage: false,
			globalStats: globalStats,
			expenses: expenses,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}
}

async function getAddExpense(req, res) {
	try {
		return res.status(200).render("backend/expenses/add", {
			pageTitle: "Edit Expense",
			path: "/expense/edit/",
			errors: false,
			userInput: false,
			expense: false,
			errorMessage: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	} catch (error) {
		return res.status(400).render("backend/expenses/add", {
			pageTitle: "Edit Expense",
			path: "/expense/edit/",
			errors: false,
			userInput: false,
			expense: false,
			errorMessage: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function getEditExpense(req, res) {
	try {
		const _id = req.params._id;
		const expense = await Expense.findOne({ _id: _id });
		const expenses = await Expense.find({}).sort({ _id: -1 });

		if (expense) {
			return res.status(200).render("admin/expenses/edit", {
				pageTitle: "Edit Expense",
				path: "/expense/edit/" + _id,
				errors: false,
				userInput: false,
				expense: expense,
				expenses: expenses,
				errorMessage: false,
				successMessage: false,
				shortData: shortData,
				cuteDate: cuteDate,
			});
		} else {
			return res.status(200).render("admin/expenses/manage", {
				pageTitle: "Manage Expenses",
				path: "/expenses/manage",
				errors: false,
				expense: false,
				userInput: false,
				errorMessage: false,
				successMessage: true,
				expenses: false,
				shortData: shortData,
				cuteDate: cuteDate,
			});
		}
	} catch (error) {
		return res.status(200).render("admin/expenses/manage", {
			pageTitle: "Manage Expenses",
			path: "/expenses/manage",
			errors: false,
			userInput: false,
			expense: false,
			errorMessage: error,
			expenses: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function putEditExpense(req, res) {
	const requestBody = req.body;
	const expenses = await Expense.find({}).sort({ _id: -1 });
	const expense = await Expense.findOne({ _id: req.params._id });
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(200).render("admin/expenses/edit", {
			pageTitle: "Edit Expense",
			path: "/expense/edit/" + _id,
			errors: false,
			userInput: requestBody,
			expense: expense,
			expenses: expenses,
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

		Expense.findOne({ _id: req.params._id })
			.then((expense) => {
				if (expense) {
					// Update the expense with the new data
					Object.assign(expense, updatedExpenseData);
					// Save the changes to the database
					return expense.save();
				} else {
					// Handle the case where the expense with the specified ID is not found
					return res.redirect(
						"/expense/manage?errorMessage=Expense could not be found"
					);
				}
			})
			.then(async (updatedExpense) => {
				// Handle the case where the update was successful
				return res.redirect(
					"/expense/manage?successMessage=Expense updated successfully"
				);
			})
			.catch((error) => {
				// Handle any errors that occurred during the update process
				return res.status(422).render("admin/expenses/manage", {
					pageTitle: "Manage Expense",
					path: "/expense/maange/",
					errors: false,
					userInput: false,
					expense: expense,
					expenses: expenses,
					errorMessage: error,
					successMessage: false,
					csrfToken: req.csrfToken(),
					shortData: shortData,
					cuteDate: cuteDate,
				});
			});
	} catch (error) {
		return res.status(422).render("admin/expenses/manage", {
			pageTitle: "Manage Expense",
			path: "/expense/maange/",
			errors: false,
			userInput: false,
			expense: expense,
			expenses: expenses,
			errorMessage: error,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function getDeleteExpense(req, res) {
	try {
		const _id = req.params._id;
		const expense = await Expense.findOneAndDelete({ _id: _id });
		if (expense) {
			return res.redirect(
				"/expense/manage?successMessage=Expense deleted successfully"
			);
		} else {
			return res.redirect(
				"/expense/manage?errorMessage=Could not delete Expense"
			);
		}
	} catch (error) {
		const expenses = await Expense.find({}).sort({ _id: -1 });
		return res.status(422).render("admin/expenses/manage", {
			pageTitle: "Edit Expense",
			path: "/expense/manaage/",
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
	listExpense,
	postAddExpense,
	getEditExpense,
	putEditExpense,
	getDeleteExpense,
	getAddExpense,
};
