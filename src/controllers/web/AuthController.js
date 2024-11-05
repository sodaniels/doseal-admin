const axios = require("axios");
const { validationResult } = require("express-validator");
const { has, result } = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");

const { Log } = require("../../helpers/Log");
const User = require("../../models/user");
const Admin = require("../../models/admin.model");
const ContactUs = require("../../models/contact-us.model");
const Page = require("../../models/page.model");
const { Hash } = require("../../helpers/hash");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const { handleValidationErrors } = require("../../helpers/validationHelper");
const ServiceCode = require("../../constants/serviceCode");
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
const { encrypt, decrypt } = require("../../helpers/crypt");
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getRegistrationPage(req, res) {
	// Log.info(
	// 	`[AuthController.js][getRegistrationPage]Visitation on Sign Up page ${req.ip}`
	// );
	// return res.render("web/auth/signup", {
	// 	pageTitle: "Doseal Limited | Signup",
	// 	path: "/signup",
	// 	errors: false,
	// 	errorMessage: false,
	// 	SITE_KEY: process.env.SITE_KEY,
	// 	captcha: recaptcha.render(),
	// 	csrfToken: req.csrfToken(),
	// });
}

async function getSigninPage(req, res) {
	Log.info(
		`[AuthController.js][getSigninPage] Visitation on Sign In page ${req.ip}`
	);
	return res.redirect(process.env.LOGIN_URL);
}
async function getSigninRedirectPage(req, res) {
	Log.info(
		`[AuthController.js][getSigninRedirectPage] on the way to get token e ${req.ip}`
	);
	const authCode = req.query.code;

	try {
		const tokenResponse = await axios.post(
			`${process.env.UNITY_BASE_URL}/oauth/token`,
			querystring.stringify({
				authCode: authCode,
				accessMode: ServiceCode.WEBSITE,
				redirect_uri: process.env.AUTH_CALLBACK_REDIRECT_URI,
			}),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
			}
		);

		const response = tokenResponse.data;

		if (response.success) {
			Log.info(
				`[AuthController.js][getSigninRedirectPage] login successful ${req.ip}`
			);
			res.cookie("jwt", response.access_token, {
				httpOnly: true,
				secure: true,
				maxAge: 2 * 60 * 60 * 1000,
			});

			const iUser = {
				_id: response._id,
				firstName: response.firstName,
				lastName: response.lastName,
				phoneNumber: response.phoneNumber,
				email: response.email,
			};

			req.session.isLoggedIn = true;
			req.session.user = iUser;
			req.session.lastloggedIn = Date.now();

			return res.redirect("../pay-bills");
		} else {
			Log.info(
				`[AuthController.js][getSigninRedirectPage] login failed ${JSON.stringify(
					response
				)}`
			);
			return res.redirect(`${process.env.LOGIN_URL}`);
		}
	} catch (error) {}
}
async function postInitiateSigin(req, res) {
	let codeSentViaEmail, user, storeUser;
	Log.info(
		`[AuthController.js][postInitiateSigin][${req.body.email}] \t initiating signin  ${req.ip}`
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
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
		Log.info(`[webController.js][postInitiateSigin] error: ${error}`);
		if (!req.body["g-recaptcha-response"]) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	}

	const { email, password } = req.body;

	User.findOne({ email: email, registration: "COMPLETED" })
		.then((iUser) => {
			user = iUser;
			if (!user) {
				// User not found
				return res.json({
					success: false,
					code: 403,
					message: "Incorrect email and password combination",
				});
			}
			return bcrypt.compare(password, iUser.password);
		})
		.then(async (result) => {
			if (!result) {
				// Password does not match
				return res.json({
					success: false,
					code: 403,
					message: "Incorrect email and password combination",
				});
			}

			// login worked
			await processEmail(user, email, res);
		})
		.catch((err) => {
			console.log(err);
			return res.json({
				success: false,
				code: 500,
				message: "An error occurred.",
			});
		});
}

async function processEmail(user, email, res) {
	try {
		Log.info(
			`[AuthController.js][postInitiateSigin][${email}] \t initial registration successful`
		);

		const pin = randId();
		const phoneNumber = user.phoneNumber;
		const q = phoneNumber.slice(-9);
		const redisKey = `otp_token_${q}`;

		let message;

		await setRedis(redisKey, pin);

		Log.info(`[AuthController.js][postInitiateSigin][${pin}] \t`);

		message = `Your Doseal verification code is ${pin}. 
				It will expire in 5 minutes. If you did not request this code, 
				ignore this message and do not share it with anyone`;

		try {
			Log.info(
				`[AuthController.js][postInitiateSigin] \t sending OTP via email`
			);
			codeSentViaEmail = await postEmail(email, message);

			if (has(codeSentViaEmail, "response")) {
				return res.json({
					success: true,
					phoneNumber: phoneNumber,
					email: user.email,
					code: 200,
					message: "Email sent successfully",
				});
			} else {
				return res.json({
					success: false,
					code: 400,
					message:
						"Email could not be be sent. Please check your email and try again",
				});
			}
		} catch (error) {
			Log.info(
				`[AuthController.js][postInitiateSigin] \t sending OTP via email: ${error}`
			);
			return res.json({
				success: false,
				code: 500,
				message: "An error has occurred",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthController.js][postInitiateSigin][${email}] \t error saving initial registration  ${error}`
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error has occurred",
		});
	}
}

async function postInitialSignup(req, res) {
	let codeSentViaEmail, uncompletedUser, storeUser;
	Log.info(
		`[AuthController.js][postInitialSignup][${req.body.email}] \t initiating registration IP: ${req.ip} `
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
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
			return res.json({
				success: false,
				code: 402,
				message: "Accout already registered. Please sign in instead.",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthController.js][postInitialSignup][${email}] \t error: ${error}  `
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred",
		});
	}

	try {
		uncompletedUser = await User.findOne({
			$or: [{ email: email }, { phoneNumber: { $regex: q, $options: "i" } }],
			registration: "INITIAL",
		});
	} catch (error) {}

	try {
		const passwd = await Hash(password);
		if (uncompletedUser) {
			uncompletedUser.phoneNumber = phoneNumber;
			uncompletedUser.email = email;
			uncompletedUser.password = passwd;
			storeUser = await uncompletedUser.save();
		} else {
			const userData = new User({
				phoneNumber: phoneNumber,
				email: email,
				password: passwd,
				role: "Subscriber",
				status: "Inactive",
			});
			storeUser = await userData.save();
		}

		if (storeUser) {
			Log.info(
				`[AuthController.js][postInitialSignup][${email}] \t initial registration successful  `
			);

			const pin = randId();
			const q = phoneNumber.slice(-9);
			const redisKey = `otp_token_${q}`;

			let message;

			await setRedis(redisKey, pin);

			Log.info(`[AuthController.js][postInitialSignup][${pin}] \t`);

			message = `Your Doseal verification code is ${pin}. 
					It will expire in 5 minutes. If you did not request this code, 
					ignore this message and do not share it with anyone`;

			try {
				Log.info(
					`[AuthController.js][postInitialSignup] \t sending OTP via email`
				);
				codeSentViaEmail = await postEmail(email, message);

				if (has(codeSentViaEmail, "response")) {
					console.log("codeSentViaEmail: " + JSON.stringify(codeSentViaEmail));

					return res.json({
						success: true,
						code: 200,
						message: "Email sent successfully",
					});
				} else {
					return res.json({
						success: false,
						code: 400,
						message:
							"Email could not be be sent. Please check your email and try again",
					});
				}
			} catch (error) {
				Log.info(
					`[AuthController.js][postInitialSignup] \t sending OTP via email: ${error}`
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
	Log.info(
		`[AuthController.js][postSignup] Posting sign up with IP: ${req.ip}`
	);
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

async function getVerifyAccount(req, res) {
	Log.info(
		`[AuthController.js][getVerifyAccount] Visitation on Verify Account Page page with IP: ${req.ip}`
	);
	return res.render("web/auth/verify-account", {
		pageTitle: "Doseal Limited | Verify Account",
		path: "/verify-account",
		errors: false,
		errorMessage: false,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function postVerifyAccount(req, res) {
	Log.info(
		`[AuthController.js][postVerifyAccount] posting verifying account IP: ${req.ip}`
	);
	const { phoneNumber, email, code } = req.body;

	const q = phoneNumber.substr(-9);

	const redisCode = await getRedis(`otp_token_${q}`);

	if (redisCode && redisCode.toString() === code.toString()) {
		let user = await User.findOne({
			$or: [{ email: email }, { phoneNumber: { $regex: q, $options: "i" } }],
		});

		// remove redis code after verification
		await removeRedis(`otp_token_${q}`);

		if (user.registration === "COMPLETED") {
			const token = await createJwtToken(user._id);

			res.cookie("jwt", token, {
				httpOnly: true,
				secure: true,
				maxAge: 2 * 60 * 60 * 1000,
			});

			const iUser = {
				_id: user._id,
				firstName: user.firstName,
				middlename: user.middleName ? agent.middleName : undefined,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				type: user.role,
				email: user.email,
			};

			req.session.isLoggedIn = true;
			req.session.user = iUser;
			req.session.lastloggedIn = Date.now();

			const timeOfLogin = Date.now();
			user.isLoggedIn = timeOfLogin;
			await user.save();

			return res.json({
				success: true,
				code: 2000,
			});
		} else {
			const token = encrypt(JSON.stringify(user._id));
			return res.json({
				success: true,
				code: 200,
				token: token,
			});
		}
	} else {
		Log.info(
			`[AuthController.js][postVerifyAccount][${phoneNumber}]${code}]\t .. wrong code`
		);
		return res.json({
			success: false,
			code: 400,
			message: "Invalid code",
		});
	}
}

async function createJwtToken(_id) {
	const jwtSecret = process.env.JWT_TOKEN;
	const expiresIn = process.env.JWT_EXPIRES_IN;

	const acccess_token = jwt.sign({ _id }, jwtSecret, {
		expiresIn,
		issuer: process.env.APP_NAME,
	});
	return { acccess_token, expiresIn };
}

async function getCompleteRegistration(req, res) {
	Log.info(
		`[AuthController.js][getCompleteRegistration] Visitation on complete registration page IP: ${req.ip}`
	);
	return res.render("web/auth/complete-registration", {
		pageTitle: "Doseal Limited | Complete Registration",
		path: "/complete-registration",
		errors: false,
		errorMessage: false,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function postCompleteRegistration(req, res) {
	Log.info(
		`[AuthController.js][postCompleteRegistration] Posting complete registration information IP: ${req.ip}`
	);
	const { firstName, lastName, idType, idNumbe, idExpiry, token } = req.body;

	const _id = JSON.parse(decrypt(token));

	let user = await User.findOne({ _id: _id });

	user.firstName = firstName;
	user.lastName = lastName;
	user.idType = idType;
	user.idNumbe = idNumbe;
	user.idExpiry = idExpiry;
	const updateUser = await user.save();
	if (updateUser) {
		const token = await createJwtToken(user._id);

		res.cookie("jwt", token, {
			httpOnly: true,
			secure: true,
			maxAge: 2 * 60 * 60 * 1000,
		});

		const iUser = {
			_id: user.user_id,
			firstName: user.firstName,
			middlename: user.middleName ? agent.middleName : undefined,
			lastName: user.lastName,
			phoneNumber: user.phoneNumber,
			type: user.type,
			email: user.email,
		};

		req.session.isLoggedIn = true;
		req.session.user = iUser;
		req.session.lastloggedIn = Date.now();

		const timeOfLogin = Date.now();
		user.isLoggedIn = timeOfLogin;
		user.registration = "COMPLETED";
		user.status = "Active";
		await user.save();

		req.headers["Authorization"] = `Bearer ${token}`;

		return res.json({
			success: true,
			code: 200,
			message: "Account created successfully",
		});
	} else {
		return res.json({
			success: falsae,
			code: 400,
			token: token,
		});
	}
}

module.exports = {
	getRegistrationPage,
	postSignup,
	postInitialSignup,
	getVerifyAccount,
	postVerifyAccount,
	getCompleteRegistration,
	postCompleteRegistration,
	getSigninPage,
	postInitiateSigin,
	getSigninRedirectPage,
};
