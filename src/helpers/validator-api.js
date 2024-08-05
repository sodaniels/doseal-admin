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
const validateBuyCredit = [
	body("amount").notEmpty().trim().withMessage("The Amount is required"),
	body("meterId").notEmpty().trim().withMessage("The Meter ID is required"),
	body("meterName").notEmpty().trim().withMessage("The Meter Name is required"),
	body("mno")
		.if(body("paymentOption").equals("Mobile Money"))
		.trim()
		.notEmpty()
		.withMessage("Networt is required when payment option is Mobile Money"),
	body("phoneNumber")
		.notEmpty()
		.trim()
		.withMessage("The Phone Number is required"),
];

module.exports = {
	validateProfile,
	validateWallet,
	validateBuyCredit,
};
