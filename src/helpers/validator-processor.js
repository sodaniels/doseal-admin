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
		.isLength({ min: 8, max: 30})
		.withMessage("Password must be minimum of 8 and maximum of 30 Characters."),
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
const validateAccountSearch = [
	body("phoneNumber")
		.notEmpty()
		.isString()
		.withMessage("Phone Number is required."),
];

const validateDataBundleSearch = [
	body("accountNumber").exists().withMessage("The Account Number is required"),
	body("network").exists().withMessage("The Network is required"),
];

const validateUtilitySearch = [
	body("accountNumber").exists().withMessage("The Account Number is required"),
	body("type").exists().withMessage("The Type is required"),
];

const validateGhaaWaterSearch = [
	body("accountNumber").exists().withMessage("The Account Number is required"),
	body("type").exists().withMessage("The Type is required"),
];



const validateEcgExecute = [
	body("meterId").notEmpty().isString().withMessage("Meter ID is required."),
	body("phoneNumber")
		.notEmpty()
		.isString()
		.withMessage("Phone Number is required."),
	body("amount").notEmpty().isString().withMessage("Amount is required."),
];

const validateTransaction = [
	body("amount").notEmpty().trim().withMessage("The Amount is required"),
	body("meterId")
		.if(body("type").equals("ECG"))
		.notEmpty()
		.trim()
		.withMessage("The Meter ID is required"),
	body("meterName")
		.if(body("type").equals("ECG"))
		.notEmpty()
		.trim()
		.withMessage("The Meter Name is required"),
	body("phoneNumber")
		.if(body("type").equals("ECG"))
		.notEmpty()
		.trim()
		.withMessage("The Phone Number is required"),
];

const validateExecute = [
	body("checksum").notEmpty().trim().withMessage("The checksum is required"),
	body("type").notEmpty().trim().withMessage("The Type is required"),
]

module.exports = {
	validateNewsRoom,
	validateInitialSignup,
	validateAccountSearch,
	validateEcgExecute,
	validateTransaction,
	validateExecute,
	validateDataBundleSearch,
	validateUtilitySearch,
	validateGhaaWaterSearch,
};
