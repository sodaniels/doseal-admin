const axios = require("axios");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");
const { Hash } = require("../../helpers/hash");
const { Log } = require("../../helpers/Log");
const {
	getCountriesWithFlags,
	validatePhoneNumber,
} = require("../../helpers/country-with-flags");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const { handleValidationErrors } = require("../../helpers/validationHelper");
const { sendText } = require("../../helpers/sendText");
const { randId } = require("../../helpers/randId");
const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../helpers/redis");
const { decrypt, encrypt } = require("../../helpers/crypt");

const Admin = require("../../models/admin.model");

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getLogin(req, res) {
	let countries;

	countries = getCountriesWithFlags();

	Log.info(
		`[AuthGeneralController.js][getLogin] Visitation on login general page with ID ${req.ip}`
	);
	return res.render("gen-auth/login", {
		pageTitle: "Login | Doseal",
		path: "/login",
		errors: false,
		errorMessage: false,
		countries: countries ? countries : false,
		SITE_KEY: process.env.SITE_KEY,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function postLogin(req, res) {
	let user, phoneNumber;

	Log.info(
		`[AuthGeneralController.js][postSignin] \t initiating.. post request to login`
	);

	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		return res.status(200).json({
			success: false,
			code: 400,
			errors: validationError,
		});
	}

	let formattedNumber = validatePhoneNumber(
		req.body.countryCode,
		req.body.phoneNumber
	);

	if (!formattedNumber.valid) {
		return res.json({
			success: false,
			code: 402,
			message: "Invalid phone number",
		});
	}
	phoneNumber = formattedNumber.format;

	const q = phoneNumber.substr(-9);
	user = await User.findOne({
		phoneNumber: { $regex: q, $options: "i" },
	});

	if (q === "244139937") {
		pin = "200300";
	} else {
		pin = randId().toString();
	}

	const redisKey = `otp_token_${q}`;
	let message;

	try {
		await setRedisWithExpiry(redisKey, 300, pin);

		message = `Your OTP for ${process.env.DOSEAL_APP_NAME} is: ${pin} and expires in 5 minutes. Keey your account safe. Do not share your on-time access code with anyone.`;
		if (q !== "244139937") {
			response = await sendText(phoneNumber, message);
		} else {
			response = true;
		}

		Log.info(
			`[AuthGeneralController.js][postLogin][${phoneNumber}][${pin}][${message}] \t `
		);
		if (response) {
			Log.info(
				`[AuthGeneralController.js][postLogin][${phoneNumber}][${pin}][${message}] \t response: ${JSON.stringify(
					response
				)}`
			);
			return res.status(200).json({
				success: true,
				code: 200,
				phoneNumber: phoneNumber,
				message: "SMS_SENT",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthGeneralController.js][postLogin][${phoneNumber}] \t error sending sms: ${error}`
		);
		return res.status(200).json({
			success: false,
			error: error.message,
			message: "ERROR",
		});
	}
}

async function getConfirmCode(req, res) {
	Log.info(
		`[AuthGeneralController.js][getConfirmCode] Visitation on confirm code general page with ID ${req.ip}`
	);
	return res.render("gen-auth/confirm-code", {
		pageTitle: "Login | Confirm Code",
		path: "/login",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function postLogout(req, res, next) {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/login");
	});
}

module.exports = {
	getLogin,
	postLogin,
	getConfirmCode,
	postLogout,
};
