const axios = require("axios");
const { validationResult } = require("express-validator");
const { has, result } = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Log } = require("../../../helpers/Log");
const User = require("../../../models/user");
const Admin = require("../../../models/admin.model");
const Page = require("../../../models/page.model");
const { Hash } = require("../../../helpers/hash");
const apiErrors = require("../../../helpers/errors/errors");
const errorMessages = require("../../../helpers/error-messages");
const { handleValidationErrors } = require("../../../helpers/validationHelper");
const {
	postEmail,
} = require("../../../services/mailers/sendEmailForLoginService");
const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../../helpers/redis");
const { randId } = require("../../../helpers/randId");
const { encrypt, decrypt } = require("../../../helpers/crypt");
const Helpers = require("../../../helpers/helper");
const helpers = new Helpers();

async function postSigin(req, res) {
	let user;
	const { email, password } = req.body;
	Log.info(
		`[AuthEmailController.js][postSigin][${email}] \t initiating signin  ${req.ip}`
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		return res.status(200).json({
			success: false,
			code: 409,
			errors: validationError,
		});
	}

	let initialCheck = await User.findOne({ email: email });
	if (!initialCheck) {
		return res.json({
			success: false,
			code: 404,
			message: "Account not found",
		});
	}

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
			`[AuthEmailController.js][postSigin][${email}] \t initial registration successful`
		);

		const pin = randId();
		const phoneNumber = user.phoneNumber;
		const q = phoneNumber.slice(-9);
		const redisKey = `otp_token_${q}`;

		let message;

		await setRedis(redisKey, pin);

		Log.info(`[AuthEmailController.js][postSigin][${pin}] \t`);

		message = `Your Doseal verification code is ${pin}. 
				It will expire in 5 minutes. If you did not request this code, 
				ignore this message and do not share it with anyone`;

		try {
			Log.info(`[AuthEmailController.js][postSigin] \t sending OTP via email`);
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
				`[AuthEmailController.js][postSigin] \t sending OTP via email: ${error}`
			);
			return res.json({
				success: false,
				code: 500,
				message: "An error has occurred",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthEmailController.js][postSigin][${email}] \t error saving initial registration  ${error}`
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error has occurred",
		});
	}
}

async function postVerifyAccount(req, res) {
	const { phoneNumber, email, code } = req.body;
	Log.info(
		`[AuthEmailController.js][postVerifyAccount][${email}] posting verifying account IP: ${req.ip}`
	);

	let initialCheck = await User.findOne({ email: email });
	if (initialCheck && initialCheck.registration !== "COMPLETED") {
		return res.json({
			success: false,
			code: 405,
			message: "Account not completed",
		});
	}

	const q = phoneNumber.substr(-9);

	const redisCode = await getRedis(`otp_token_${q}`);
	if (!redisCode) {
		return res.status(200).json({
			success: false,
			code: 401,
			message: "CODE_EXPIRED",
		});
	}

	if (redisCode && redisCode.toString() === code.toString()) {
		let user = await User.findOne({
			$or: [{ email: email }, { phoneNumber: { $regex: q, $options: "i" } }],
		});

		// remove redis code after verification
		await removeRedis(`otp_token_${q}`);

		return res.json({
			success: true,
			userId: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			phoneNumber: user.phoneNumber,
			status: user.registration,
			balance: user.balance,
			token: await createJwtToken(user._id),
		});
	} else {
		Log.info(
			`[AuthEmailController.js][postVerifyAccount][${email}]${code}]\t .. wrong code`
		);
		return res.json({
			success: false,
			code: 400,
			message: "Invalid code",
		});
	}
}
async function postVerifyAccount__(req, res) {
	const { email } = req.body;
	let hubtelMSISDNResponse,
		registeredFirstName,
		registeredLastName,
		registeredName,
		nameFromTelco;
	let AcountStatus = "INITIAL";
	try {
		Log.info(
			`[AuthApiController.js][postVerifyAccount][${email} \t ****** initiate confirm code  `
		);
		const q = req.body.phoneNumber.substr(-9);

		let user = await User.findOne({
			phoneNumber: { $regex: q, $options: "i" },
		});

		if (!user) {
			try {
				Log.info(
					`[AuthApiController.js][confirmCode][${email}] \t  quering MSISDN ********************************  `
				);
				hubtelMSISDNResponse = await restServices.postHubtelMSISDNSearchService(
					req.body.phoneNumber
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
					`[AuthApiController.js][confirmCode][${
						req.body.phoneNumber
					}] \t  MSISDN Response: ${JSON.stringify(hubtelMSISDNResponse)} `
				);
			} catch (error) {
				Log.info(
					`[AuthApiController.js][confirmCode][${req.body.phoneNumber}] \t  error query MSISDN: ${error}  `
				);
			}
			try {
				const userData = new User({
					phoneNumber: req.body.phoneNumber,
					firstName: registeredFirstName ? registeredFirstName : undefined,
					lastName: registeredLastName ? registeredLastName : undefined,
					nameFromTelco:
						registeredLastName || registeredLastName ? true : false,
					registration: AcountStatus,
					role: "Subscriber",
					status: "Inactive",
				});
				const storeUser = await userData.save();
				if (storeUser) {
					Log.info(
						`[AuthApiController.js][confirmCode][${req.body.phoneNumber}] \t initial registration successful  `
					);
				}
			} catch (error) {
				Log.info(
					`[AuthApiController.js][confirmCode][${req.body.phoneNumber}] \t error saving initial registration  ${error}`
				);
			}
		}

		if (user && user.registration === "COMPLETED") {
			AcountStatus = "COMPLETED";
		}

		const redisCode = await getRedis(`otp_token_${q}`);
		if (!redisCode) {
			return res.status(200).json({
				success: false,
				message: "CODE_EXPIRED",
			});
		}
		if (redisCode.toString() === req.body.code.toString()) {
			const registration_code = randId().toString();

			const encryptedCode = encrypt(registration_code);
			console.log("encryptedCode: " + encryptedCode);

			// remove redis code after verification
			await removeRedis(`otp_token_${q}`);

			if (user && user.registration === "COMPLETED") {
				return res.json({
					success: true,
					userId: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					phoneNumber: user.phoneNumber,
					status: user.registration,
					balance: user.balance,
					nameFromTelco: user.nameFromTelco,
					token: await createJwtToken(user._id),
				});
			} else {
				const redisKey = `registration_token_${q}`;
				await setRedis(redisKey, registration_code);
				return res.status(200).json({
					success: true,
					message: "SUCCESS",
					status: AcountStatus,
					accessCode: encryptedCode,
					registeredName: registeredName ? registeredName : undefined,
					nameFromTelco: nameFromTelco ? nameFromTelco : undefined,
				});
			}
		}
		Log.info(
			`[AuthApiController.js][confirmCode][${req.body.phoneNumber}]${req.body.code}]\t .. wrong code`
		);
		return res.status(200).json({
			success: false,
			message: "WRONG_CODE",
			status: AcountStatus,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: error.message,
			message: "ERROR_OCCURRED",
		});
	}
}

async function postInitialSignup(req, res) {
	let codeSentViaEmail, uncompletedUser, storeUser;
	Log.info(
		`[AuthEmailController.js][postInitialSignup][${req.body.email}] \t initiating registration IP: ${req.ip} `
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
			`[AuthEmailController.js][postInitialSignup][${email}] \t error: ${error}  `
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
				`[AuthEmailController.js][postInitialSignup][${email}] \t initial registration successful  `
			);

			const pin = randId();
			const q = phoneNumber.slice(-9);
			const redisKey = `otp_token_${q}`;

			let message;

			await setRedis(redisKey, pin);

			Log.info(`[AuthEmailController.js][postInitialSignup][${pin}] \t`);

			message = `Your Doseal verification code is ${pin}. 
					It will expire in 5 minutes. If you did not request this code, 
					ignore this message and do not share it with anyone`;

			try {
				Log.info(
					`[AuthEmailController.js][postInitialSignup] \t sending OTP via email`
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
					`[AuthEmailController.js][postInitialSignup] \t sending OTP via email: ${error}`
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
			`[AuthEmailController.js][postInitialSignup][${req.body.email}] \t error saving initial registration  ${error}`
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
		`[AuthEmailController.js][postSignup] Posting sign up with IP: ${req.ip}`
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

async function createJwtToken(_id) {
	const jwtSecret = process.env.JWT_TOKEN;
	const expiresIn = process.env.JWT_EXPIRES_IN;

	const acccess_token = jwt.sign({ _id }, jwtSecret, {
		expiresIn,
		issuer: process.env.APP_NAME,
	});
	return { acccess_token, expiresIn };
}

async function postCompleteRegistration(req, res) {
	Log.info(
		`[AuthEmailController.js][postCompleteRegistration] Posting complete registration information IP: ${req.ip}`
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

async function createToken(_id) {
	const jwtSecret = process.env.JWT_TOKEN;
	const expiresIn = process.env.EXPIRES_IN;

	const acccess_token = jwt.sign({ _id }, jwtSecret, {
		expiresIn,
		issuer: process.env.APP_NAME,
	});
	return { acccess_token, expiresIn };
}

module.exports = {
	postSignup,
	postInitialSignup,
	postVerifyAccount,
	postCompleteRegistration,
	postSigin,
};
