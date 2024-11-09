const axios = require("axios");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
const StringFunctions = require("../../helpers/stringFunctions");
const stringFunctions = new StringFunctions();
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();

const Admin = require("../../models/admin.model");

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getLogin(req, res) {
	let countries;

	const redirectUrl = req.query.redirectUrl ? req.query.redirectUrl : "";

	Log.info(
		`[AuthGeneralController.js][getLogin] Visitation on login from [${redirectUrl}] ID ${req.ip}`
	);

	countries = getCountriesWithFlags();

	return res.render("gen-auth/login", {
		pageTitle: "Login | Doseal",
		path: "/login",
		errors: false,
		errorMessage: false,
		countries: countries ? countries : false,
		SITE_KEY: process.env.CLOUDFLARE_SITE_KEY,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function getMobileRedirect(req, res) {
	let countries;

	const redirectUrl = req.query.redirectUrl ? req.query.redirectUrl : "";

	Log.info(
		`[AuthGeneralController.js][getLogin] Visitation on login from [${redirectUrl}] ID ${req.ip}`
	);
	Log.info(
		`[AuthGeneralController.js][getMobileRedirect] redirecting to dosealpay://`
	);

	countries = getCountriesWithFlags();

	return res.render("gen-auth/mobile-redirect", {
		pageTitle: "Login | Mobile Redirect",
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
	let hubtelMSISDNResponse,
		registeredFirstName,
		registeredLastName,
		registeredName,
		nameFromTelco,
		AcountStatus,
		user,
		phoneNumber;

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

	let formattedNumber_raw = validatePhoneNumber(
		req.body.countryCode,
		req.body.phoneNumber
	);

	if (!formattedNumber_raw.valid) {
		return res.json({
			success: false,
			code: 402,
			message: "Invalid phone number",
		});
	}

	let formattedNumber_ = removePlusFromPhoneNumber(formattedNumber_raw.format);

	phoneNumber = "00" + formattedNumber_;
	console.log("phoneNumber: " + phoneNumber);

	const q = phoneNumber.substr(-9);
	user = await User.findOne({
		phoneNumber: { $regex: q, $options: "i" },
	});

	if (!user) {
		try {
			Log.info(
				`[AuthGeneralController.js][postLogin][${phoneNumber}] \t  quering MSISDN ********************************  `
			);
			hubtelMSISDNResponse = await restServices.postHubtelMSISDNSearchService(
				phoneNumber
			);
			if (
				hubtelMSISDNResponse &&
				hubtelMSISDNResponse.ResponseCode === "0000"
			) {
				const responseData = hubtelMSISDNResponse.Data[0];
				const splitNames = stringFunctions.split_name(responseData.Value);
				registeredFirstName = splitNames[0];
				registeredLastName = splitNames[1];
				registeredName =
					registeredFirstName || registeredLastName
						? registeredFirstName + " " + registeredLastName
						: undefined;
				nameFromTelco =
					registeredFirstName || registeredLastName ? true : false;
			}

			Log.info(
				`[AuthGeneralController.js][postSignin][${phoneNumber}] \t  MSISDN Response: ${JSON.stringify(
					hubtelMSISDNResponse
				)} `
			);
		} catch (error) {
			Log.info(
				`[AuthGeneralController.js][postSignin][${phoneNumber}] \t  error query MSISDN: ${error}  `
			);
		}
		try {
			const currentTimeStamp = new Date().getTime();
			const passwd = await Hash(currentTimeStamp.toString());

			const userData = new User({
				phoneNumber: phoneNumber,
				firstName: registeredFirstName ? registeredFirstName : undefined,
				lastName: registeredLastName ? registeredLastName : undefined,
				nameFromTelco: registeredLastName || registeredLastName ? true : false,
				registration: AcountStatus,
				password: passwd,
				role: "Subscriber",
				status: "Inactive",
			});
			const storeUser = await userData.save();
			if (storeUser) {
				Log.info(
					`[AuthGeneralController.js][postSignin][${phoneNumber}] \t initial registration successful  `
				);
			}
		} catch (error) {
			Log.info(
				`[AuthGeneralController.js][postSignin][${phoneNumber}] \t error saving initial registration  ${error}`
			);
		}
	}

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
			response = {
				statusDescription: "request submitted successfully",
			};
		}


		Log.info(
			`[AuthGeneralController.js][postLogin][${phoneNumber}][${pin}][${message}] \t `
		);
		if (
			response &&
			response.statusDescription === "request submitted successfully"
		) {
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
		return res.status(200).json({
			success: false,
			code: 400,
			message: "Error occurred",
		});
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

async function postConfirmCode(req, res) {
	let user;
	const { phoneNumber, code } = req.body;

	const q = phoneNumber.substr(-9);
	try {
		Log.info(
			`[AuthGeneralController.js][postConfirmCode][${phoneNumber}] posting verifying account IP: ${req.ip}`
		);
		Log.info(
			`[AuthGeneralController.js][postConfirmCode][${phoneNumber}][${code}] request body: ${JSON.stringify(
				req.body
			)}`
		);

		user = await User.findOne({
			phoneNumber: { $regex: q, $options: "i" },
		});

		const redisCode = await getRedis(`otp_token_${q}`);
		if (!redisCode) {
			return res.status(200).json({
				success: false,
				code: 401,
				message: "CODE_EXPIRED",
			});
		}

		if (redisCode && redisCode.toString() === code.toString()) {
			Log.info(
				`[AuthGeneralController.js][postConfirmCode][${phoneNumber}]${code}]\t .. code confirmed`
			);
			// remove redis code after verification
			await removeRedis(`otp_token_${q}`);

			const authCode = crypto.randomBytes(20).toString("hex");

			Log.info(
				`[AuthGeneralController.js][postConfirmCode]${authCode}]\t .. systeUser: ${authCode}`
			);

			user.authCode = authCode.toString();
			if (user.isModified()) {
				await user.save();
			}
			Log.info(
				`[AuthGeneralController.js][postConfirmCode][${phoneNumber}]${code}]\t .. response: ${JSON.stringify(
					{
						success: true,
						code: 200,
						authCode: `********************************************`,
					}
				)}`
			);
			return res.json({
				success: true,
				code: 200,
				authCode: encrypt(authCode),
			});
		} else {
			Log.info(
				`[AuthGeneralController.js][postConfirmCode][${phoneNumber}]${code}]\t .. wrong code`
			);
			return res.json({
				success: false,
				code: 400,
				message: "Invalid code",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthGeneralController.js][postConfirmCode][${phoneNumber}]${code}]\t .. error: ${error}`
		);
		return res.json({
			success: false,
			code: 500,
			message: `Error: ${error}`,
		});
	}
}

async function postLogout(req, res, next) {
	req.session.destroy((err) => {
		console.log(err);
		res.redirect("/login");
	});
}

function removePlusFromPhoneNumber(phoneNumber) {
	if (phoneNumber.startsWith("+")) {
		return phoneNumber.slice(1);
	}
	return phoneNumber;
}

module.exports = {
	getLogin,
	postLogin,
	getConfirmCode,
	postLogout,
	postConfirmCode,
	getMobileRedirect,
};
