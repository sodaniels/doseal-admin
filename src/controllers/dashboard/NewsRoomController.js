const NewsRoom = require("../../models/news-room.model");
const { Log } = require("../../helpers/Log");
const { shortData, longDate, cuteDate } = require("../../helpers/shortData");
const { rand10Id, randId } = require("../../helpers/randId");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();

async function listItem(req, res) {
	const errorMessage = req.query.errorMessage;
	const successMessage = req.query.successMessage;
	const admin = req.session.admin;

	const items = await NewsRoom.find({}).sort({ _id: -1 });
	try {
		if (items) {
			return res.status(200).render("backend/news-room/manage", {
				pageTitle: "Manage News Room",
				path: "/news-room/manage",
				errors: false,
				userInput: false,
				errorMessage: errorMessage ? errorMessage : false,
				successMessage: successMessage ? successMessage : false,
				items: items,
				admin: admin,
				item: false,
				shortData: shortData,
				cuteDate: cuteDate,
				truncateText: helpers.truncateText,
			});
		}

		return res.status(200).render("backend/news-room/manage", {
			pageTitle: "Manage News Room",
			path: "/news-room/manage",
			errors: false,
			userInput: false,
			errorMessage: false,
			successMessage: true,
			items: items,
			admin: admin,
			item: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	} catch (error) {
		return res.status(200).render("backend/news-room/manage", {
			pageTitle: "Manage News Room",
			path: "/news-room/manage",
			errors: false,
			userInput: false,
			errorMessage: error,
			items: items,
			admin: admin,
			item: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}
}

async function postAddItem(req, res) {
	const items = await NewsRoom.find({}).sort({ _id: -1 });
	const errors = validationResult(req);
	const requestBody = req.body;
	const admin = req.session.admin;

	if (!errors.isEmpty()) {
		return res.status(200).render("backend/news-room/manage", {
			pageTitle: "Manage News Room",
			path: "/news-room/manage",
			errors: errors.array(),
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			items: items,
			admin: admin,
			item: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}

	try {
		const imageFile = req.files["image"][0];
		const baseUrl = `${req.protocol}s://${req.get("host")}`;
		const imageFileUrl = `${baseUrl}/uploads/news/${imageFile.filename}`;

		const itemObject = new NewsRoom({
			title: req.body.title,
			image: imageFileUrl,
			content: req.body.content,
			excerpt: req.body.excerpt,
			createdBy: admin._id,
		});

		const savedItem = await itemObject.save();

		if (savedItem) {
			const items = await NewsRoom.find({}).sort({ _id: -1 });
			return res.status(200).render("backend/news-room/manage", {
				pageTitle: "Manage News Room",
				path: "/news-room/manage",
				errors: false,
				userInput: requestBody,
				errorMessage: false,
				successMessage: "Help Desk saved successfully",
				items: items,
				admin: admin,
				item: false,
				shortData: shortData,
				truncateText: helpers.truncateText,
			});
		}

		return res.status(200).render("backend/news-room/manage", {
			pageTitle: "Manage News Room",
			path: "/news-room/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: false,
			successMessage: false,
			items: items,
			admin: admin,
			item: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	} catch (error) {
		Log.info(
			`[NewsRoomController.js][postAddItem]\t .. error saving news item: ${error}`
		);
		return res.status(200).render("backend/news-room/manage", {
			pageTitle: "Manage News Room",
			path: "/news-room/manage",
			errors: false,
			userInput: requestBody,
			errorMessage: error,
			successMessage: false,
			items: items,
			admin: admin,
			item: false,
			shortData: shortData,
			cuteDate: cuteDate,
			truncateText: helpers.truncateText,
		});
	}
}

async function getAddItem(req, res) {
	const admin = req.session.admin;
	try {
		return res.status(200).render("backend/news-room/add", {
			pageTitle: "Add News Item",
			path: "/news-room/add/",
			errors: false,
			userInput: false,
			item: false,
			items: false,
			errorMessage: false,
			admin: admin,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	} catch (error) {
		return res.status(200).render("backend/news-room/add", {
			pageTitle: "Add News Item",
			path: "/news-room/add/",
			errors: false,
			userInput: false,
			errorMessage: error,
			item: false,
			admin: admin,
			items: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function getEditItem(req, res) {
	const _id = req.params._id;
	const admin = req.session.admin;
	try {
		const item = await NewsRoom.findOne({ _id: _id });
		const items = await NewsRoom.find({}).sort({ _id: -1 });

		if (item) {
			return res.status(200).render("backend/news-room/add", {
				pageTitle: "Edit News Item",
				path: "/news-room/edit/" + _id,
				errors: false,
				userInput: false,
				item: item,
				admin: admin,
				items: items,
				errorMessage: false,
				successMessage: false,
				shortData: shortData,
				cuteDate: cuteDate,
			});
		} else {
			return res.status(200).render("backend/news-room/add", {
				pageTitle: "Edit News Item",
				path: "/news-room/edit/" + _id,
				errors: false,
				userInput: false,
				errorMessage: false,
				successMessage: true,
				admin: admin,
				item: item,
				items: items,
				shortData: shortData,
				cuteDate: cuteDate,
			});
		}
	} catch (error) {
		return res.status(200).render("backend/news-room/add", {
			pageTitle: "Edit News Item",
			path: "/news-room/edit/" + _id,
			errors: false,
			userInput: false,
			errorMessage: error,
			item: false,
			admin: admin,
			items: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}
async function putEditItem(req, res) {
	let imageFile, baseUrl, imageFileUrl, updatedExpenseData;
	const requestBody = req.body;
	const _id = req.params._id;
	const items = await NewsRoom.find({}).sort({ _id: -1 });
	const item = await NewsRoom.findOne({ _id: req.params._id });
	const errors = validationResult(req);
	const admin = req.session.admin;

	if (!errors.isEmpty()) {
		return res.status(200).render("backend/news-room/add", {
			pageTitle: "Edit News Item",
			path: "/news-room/edit/" + _id,
			errors: false,
			userInput: requestBody,
			items: items,
			admin: admin,
			item: item,
			errorMessage: false,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}

	try {
		imageFile =
			req.files && req.files["image"] && req.files["image"].length > 0
				? req.files["image"][0]
				: null;
		if (imageFile) {
			baseUrl = `${req.protocol}://${req.get("host")}`;
			imageFileUrl = `${baseUrl}/uploads/news/${imageFile.filename}`;

			updatedExpenseData = {
				title: req.body.title,
				image: imageFileUrl ? imageFileUrl : undefined,
				content: req.body.content,
				excerpt: req.body.excerpt,
			};
	
		} else {
			updatedExpenseData = {
				title: req.body.title,
				content: req.body.content,
				excerpt: req.body.excerpt,
			};
	
		}

		
		NewsRoom.findOne({ _id: req.params._id })
			.then((item) => {
				if (item) {
					// Update the item with the new data
					Object.assign(item, updatedExpenseData);
					// Save the changes to the database
					return item.save();
				} else {
					// Handle the case where the expense with the specified ID is not found
					return res.redirect(
						"/news-room/manage?errorMessage=News Item could not be found"
					);
				}
			})
			.then(async (updatedExpense) => {
				// Handle the case where the update was successful
				return res.redirect(
					"/news-room/manage?successMessage=News Item updated successfully"
				);
			})
			.catch((error) => {
				// Handle any errors that occurred during the update process
				return res.status(200).render("backend/news-room/add", {
					pageTitle: "Edit News Item",
					path: "/news-room/edit/" + _id,
					errors: false,
					userInput: false,
					items: items,
					item: item,
					admin: admin,
					errorMessage: error,
					successMessage: false,
					shortData: shortData,
					cuteDate: cuteDate,
				});
			});
	} catch (error) {
		return res.status(200).render("backend/news-room/add", {
			pageTitle: "Edit News Item",
			path: "/news-room/edit/" + _id,
			errors: false,
			userInput: false,
			items: items,
			item: item,
			admin: admin,
			errorMessage: error,
			successMessage: false,
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

async function getDeleteItem(req, res) {
	const admin = req.session.admin;
	try {
		const _id = req.params._id;
		const item = await NewsRoom.findOneAndDelete({ _id: _id });
		if (item) {
			return res.redirect(
				"/news-room/manage?successMessage=Item deleted successfully"
			);
		} else {
			return res.redirect(
				"/news-room/manage?errorMessage=Could not delete Item"
			);
		}
	} catch (error) {
		const helps = await NewsRoom.find({}).sort({ _id: -1 });
		return res.status(422).render("admin/news-room/manage", {
			pageTitle: "Edit News Item",
			path: "/news-room/edit/" + _id,
			errors: false,
			userInput: false,
			help: false,
			helps: helps,
			admin: admin,
			errorMessage: error,
			successMessage: false,
			csrfToken: req.csrfToken(),
			shortData: shortData,
			cuteDate: cuteDate,
		});
	}
}

module.exports = {
	getAddItem,
	listItem,
	postAddItem,
	getEditItem,
	putEditItem,
	getDeleteItem,
};
