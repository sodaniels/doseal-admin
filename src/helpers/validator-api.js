const {
	body,
	check,
	query,
	validationResult,
	header,
} = require("express-validator");
const moment = require("moment");

const validateProfile = [
	body("firstName").exists().withMessage("The first name is required"),
	body("lastName").exists().withMessage("The last name is required"),
	body("email")
		.optional({ checkFalsy: true })
		.isEmail()
		.withMessage("The email must be a valid email address"),
];

const validateWallet = [
	body("phoneNumber").exists().withMessage("The Phone Number is required"),
	body("mno").exists().withMessage("The Network is required"),
];


module.exports = {
	validateProfile,
	validateWallet,
};
