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

const validateNewsRoom = [
	body("title").notEmpty().isString().withMessage("Title is required."),
	body("image").notEmpty().isString().withMessage("Image is required."),
	body("excerpt").notEmpty().isString().withMessage("Excerpt is required."),
	body("content").notEmpty().isString().withMessage("Content is required."),
];


const validateSignUpWithEmail = [
	body("firstName").notEmpty().isString().withMessage("First name is required."),
	body("lastName").notEmpty().isString().withMessage("Last name is required."),
	body("email").notEmpty().isString().isEmail().withMessage("Email is required is required."),
	body("phoneNumber").notEmpty().isString().withMessage("Phone number is required."),
];


module.exports = {
	validateHelpDesk,
	validateNewsRoom,
	validateSignUpWithEmail,
};
