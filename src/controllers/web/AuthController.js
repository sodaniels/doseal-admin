const axios = require("axios");
const { validationResult } = require("express-validator");
const { Log } = require("../../helpers/Log");
const User = require("../../models/user");
const Admin = require("../../models/admin.model");
const ContactUs = require("../../models/contact-us.model");
const Page = require("../../models/page.model");
const { Hash } = require("../../helpers/hash");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const { has } = require("lodash");
const { handleValidationErrors } = require("../../helpers/validationHelper");
const {
	postEmail,
} = require("../../services/mailers/sendEmailForLoginService");
const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../helpers/redis");
const { randId } = require("../../helpers/randId");

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getRegistrationPage(req, res) {
	return res.render("web/auth/signup", {
		pageTitle: "Doseal Limited | Signup",
		path: "/signup",
		errors: false,
		errorMessage: false,
		SITE_KEY: process.env.SITE_KEY,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function postInitialSignup(req, res) {
	let codeSentViaEmail;
	Log.info(
		`[AuthController.js][postInitialSignup][${req.body.email}] \t initiating registration  `
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		// const errorRes = await apiErrors.create(
		// 	errorMessages.errors.API_MESSAGE_SIGNUP_FAILED,
		// 	"POST",
		// 	validationError,
		// 	undefined
		// );
		return res.status(200).json({
			success: false,
			code: 409,
			errors: validationError,
		});
	}

	const captchaResponse = req.body["g-recaptcha-response"];
	const secret_key = process.env.SECRET_KEY;

	if (!req.body["g-recaptcha-response"]) {
		return res.json({
			success: false,
			code: 401,
			message: "Please select the security check",
		});
	}

	try {
		const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captchaResponse}`;
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				secret: secret_key,
				response: captchaResponse,
			}),
		};
		const response = await fetch(url, requestOptions);
		const googleResponse = await response.json();
		if (!googleResponse.success) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	} catch (error) {
		Log.info(`[webController.js][postContacUs] error: ${error}`);
		if (!req.body["g-recaptcha-response"]) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	}

	const { email, phoneNumber, password } = req.body;

	const q = phoneNumber.slice(-9);

	try {
		let user = await User.findOne({
			$or: [{ email: email }, { phoneNumber: { $regex: q, $options: "i" } }],
			registration: "COMPLETED",
		});
		if (user) {
			return res.redirect(
				"signin?message=You already have an account with us Kindly signin."
			);
		}
	} catch (error) {
		Log.info(
			`[AuthController.js][postInitialSignup][${email}] \t error: ${error}  `
		);
	}

	try {
		const passwd = await Hash(password);

		const userData = new User({
			phoneNumber: phoneNumber,
			email: email,
			password: passwd,
			role: "Subscriber",
			status: "Inactive",
		});
		const storeUser = await userData.save();
		if (storeUser) {
			Log.info(
				`[AuthController.js][postInitialSignup][${email}] \t initial registration successful  `
			);

			const pin = randId();
			const q = phoneNumber.slice(-9);
			const redisKey = `otp_token_${q}`;

			let message;

			await setRedis(redisKey, pin);

			Log.info(`[nigeriaAuthController.js][postInitialSignup][${pin}] \t`);

			message = `Your Doseal verification code is ${pin}. 
					It will expire in 5 minutes. If you did not request this code, 
					ignore this message and do not share it with anyone`;

			try {
				Log.info(
					`[nigeriaAuthController.js][postInitialSignup] \t sending OTP via email`
				);
				codeSentViaEmail = await postEmail(email, message);

				if (has(codeSentViaEmail, "response")) {
					console.log("codeSentViaEmail: " + JSON.stringify(codeSentViaEmail));
					return res.json({
						success: true,
						code: 200,
						message: "Initial registration successful",
					});
				} else {
					return res.redirect(
						"verify-account?message=Please check your email and verify your account.."
					);
				}
			} catch (error) {
				Log.info(
					`[nigeriaAuthController.js][postInitialSignup] \t sending OTP via email: ${error}`
				);
			}

			return res.json({
				success: true,
				code: 200,
				message: "Initial Registration successful",
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "Initial Registration Failed",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthController.js][postInitialSignup][${req.body.email}] \t error saving initial registration  ${error}`
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error has occurred",
		});
	}
}

async function postSignup(req, res) {
	const captchaResponse = req.body["g-recaptcha-response"];
	const secret_key = process.env.SECRET_KEY;

	if (!req.body["g-recaptcha-response"]) {
		return res.json({
			success: false,
			code: 401,
			message: "Please select the security check",
		});
	}

	try {
		const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captchaResponse}`;
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				secret: secret_key,
				response: captchaResponse,
			}),
		};
		const response = await fetch(url, requestOptions);
		const googleResponse = await response.json();
		if (!googleResponse.success) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	} catch (error) {
		Log.info(`[webController.js][postContacUs] error: ${error}`);
		if (!req.body["g-recaptcha-response"]) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	}

	try {
		const contactObject = new ContactUs({
			firstName: firstName,
			lastName: lastName,
			phoneNumber: phoneNumber,
			email: email,
			idType: idType,
			idNumber: idNumber,
			idExpiry: idExpiry,
		});

		const storeContactUs = await contactObject.save();
		if (storeContactUs) {
			return res.json({
				success: true,
				code: 200,
				message: "We have received your message. Thank you for choosing Doseal",
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "An error occurred while storing your information",
			});
		}
	} catch (error) {
		Log.info(`[webController.js][postContacUs] error: ${error}`);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while storing your information",
		});
	}
}

module.exports = {
	getRegistrationPage,
	postSignup,
	postInitialSignup,
};
