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
	body("mno")
		.if(body("paymentOption").equals("Mobile Money"))
		.trim()
		.notEmpty()
		.withMessage("Networt is required when payment option is Mobile Money"),
	body("phoneNumber")
		.if(
			body("paymentOption").equals("Mobile Money") || body("type").equals("ECG")
		)
		.notEmpty()
		.trim()
		.withMessage("The Phone Number is required"),
];

const validateAccount = [
	body("phoneNumber")
		.notEmpty()
		.trim()
		.withMessage("The Phone Number is required"),
	body("mno").notEmpty().trim().withMessage("The Network is required"),
	// body("meterName").notEmpty().trim().withMessage("The Meter Name is required"),
	// body("paymentOption").notEmpty().trim().withMessage("The Payment Option is required"),
	// body("mno")
	// 	.if(body("paymentOption").equals("Mobile Money"))
	// 	.trim()
	// 	.notEmpty()
	// 	.withMessage("Networt is required when payment option is Mobile Money"),
	// body("phoneNumber")
	// 	.if(body("paymentOption").equals("Mobile Money"))
	// 	.notEmpty()
	// 	.trim()
	// 	.withMessage("The Phone Number is required"),
];
const validateEcgSearch = [
	body("phoneNumber").exists().withMessage("The Phone Number is required"),
];

const validateUtilitySearch = [
	body("accountNumber").exists().withMessage("The Account Number is required"),
];
const validatePayEcg = [
	body("phoneNumber").exists().withMessage("The Phone Number is required"),
	body("meterName").exists().withMessage("The Meter Name is required"),
	body("meterId").exists().withMessage("The Meter ID is required"),
	body("amount").exists().withMessage("The Amount is required"),
];

const validateWalletTopup = [
	body("amount").exists().withMessage("The Amount is required"),
];

const validateIssueReport = [
	body("title").exists().withMessage("The title is required"),
	body("category").exists().withMessage("The category is required"),
	body("message").exists().withMessage("The message is required"),
];
const validateTransactionStatus = [
	body("clientReference").exists().withMessage("The Client Reference is required"),
];
const validateFeedback = [
	body("rating").exists().withMessage("The rating is required"),
];

module.exports = {
	validateProfile,
	validateWallet,
	validateBuyCredit,
	validateAccount,
	validateEcgSearch,
	validateUtilitySearch,
	validatePayEcg,
	validateWalletTopup,
	validateIssueReport,
	validateFeedback,
	validateTransactionStatus,
};
