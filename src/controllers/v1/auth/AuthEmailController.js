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

async function postSignup(req, res) {
	let codeSentViaEmail, uncompletedUser, storeUser;

	const {
		firstName,
		lastName,
		phoneNumber,
		email,
		password,
	} = req.body;

	Log.info(
		`[AuthEmailController.js][postSignup][${email}] \t initiating registration IP: ${req.ip} `
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		return res.status(200).json({
			success: false,
			code: 409,
			errors: validationError,
		});
	}

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
			`[AuthEmailController.js][postSignup][${email}] \t error: ${error}  `
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
				`[AuthEmailController.js][postSignup][${email}] \t initial registration successful  `
			);

			const pin = randId();
			const q = phoneNumber.slice(-9);
			const redisKey = `otp_token_${q}`;

			let message;

			await setRedis(redisKey, pin);

			Log.info(`[AuthEmailController.js][postSignup][${pin}] \t`);

			message = `Your Doseal verification code is ${pin}. 
					It will expire in 5 minutes. If you did not request this code, 
					ignore this message and do not share it with anyone`;

			try {
				Log.info(
					`[AuthEmailController.js][postSignup] \t sending OTP via email`
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
					`[AuthEmailController.js][postSignup] \t sending OTP via email: ${error}`
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
			`[AuthEmailController.js][postSignup][${req.body.email}] \t error saving initial registration  ${error}`
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error has occurred",
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
	postVerifyAccount,
	postCompleteRegistration,
	postSigin,
};
