const User = require("../models/user");
const { body } = require("express-validator");
const { parseISO, isPast } = require("date-fns");
const { validateLatLngFormat } = require("../Middleware/validation");

const idExpiryDateValidator = (value) => {
	const date = parseISO(value); // Parse the date string into a Date object
	const currentDate = new Date(); // Get the current date
	if (isPast(date)) {
		throw new Error("ID expiry date must not be in the past.");
	}
	return true;
};

const validateHelpDesk = [
	body("title").notEmpty().isString().withMessage("Title is required."),
	body("category").notEmpty().isString().withMessage("Category is required."),
	body("content").notEmpty().isString().withMessage("Content is required."),
];

module.exports = {
	validateHelpDesk,
};
