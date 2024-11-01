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

const validateInitialSignup = [
	body("phoneNumber")
		.notEmpty()
		.withMessage("Phone Number is required.")
		.isMobilePhone()
		.withMessage("Invalid Phone format."),
	body("email")
		.notEmpty()
		.withMessage("Email is required.")
		.isEmail()
		.withMessage("Invalid email format."),
	body("password")
		.notEmpty()
		.withMessage("Password is required.")
		.isString()
		.isLength({ min: 8, max: 30 })
		.withMessage("Password must be at least 8 characters long."),
	body("confirmPassword")
		.notEmpty()
		.withMessage("Confirm password is required.")
		.isString()
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match."),
];

const validateNewsRoom = [
	body("title").notEmpty().isString().withMessage("Title is required."),
	body("image").notEmpty().isString().withMessage("Image is required."),
	body("excerpt").notEmpty().isString().withMessage("Excerpt is required."),
	body("content").notEmpty().isString().withMessage("Content is required."),
];

module.exports = {
	validateNewsRoom,
	validateInitialSignup,
};
