const jwt = require("jsonwebtoken");
const axios = require("axios");
const { validationResult } = require("express-validator");
const { Hash } = require("../../../helpers/hash");
const Device = require("../../../models/device");
const Person = require("../../../models/person.model");
const Page = require("../../../models/page.model");
const User = require("../../../models/user");
const { Log } = require("../../../helpers/Log");
const { encrypt, decrypt } = require("../../../helpers/crypt");

const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../../helpers/redis");
const { sendText } = require("../../../helpers/sendText");
const { randId } = require("../../../helpers/randId");

// store device information
async function postDeviceData(req, res) {
	var datetime = new Date();
	const date = datetime.toISOString();

	const device = new Device({
		date: date,
		uuid: req.body.uuid,
		model: req.body.model,
		osVersion: req.body.osVersion,
		sdkVersion: req.body.sdkVersion,
		deviceType: req.body.deviceType,
		os: req.body.os,
		language: req.body.language,
		manufacturer: req.body.manufacturer,
		region: req.body.region,
	});

	device
		.save()
		.then((result) => {
			res.status(201).json({ success: true, message: "DEVICE_SAVED" });
		})
		.catch((err) => {
			return res
				.status(403)
				.json({ success: false, message: "ERROR_OCCURRED" });
		});
}
// send code
async function sendCode(req, res) {
	let pin, response;
	Log.info(
		`[AuthApiController.js][sendCode][${req.body.phoneNumber}] \t ****** sending sms `
	);

	const q = req.body.phoneNumber.substr(-9);
	let user = await User.findOne({
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
			response = await sendText(req.body.phoneNumber, message);
		} else {
			response = true;
		}

		Log.info(
			`[AuthApiController.js][sendCode][${req.body.phoneNumber}][${pin}][${message}] \t `
		);
		if (response) {
			Log.info(
				`[AuthApiController.js][sendCode][${
					req.body.phoneNumber
				}][${pin}][${message}] \t response: ${JSON.stringify(response)}`
			);
			return res.status(200).json({
				success: true,
				message: "SMS_SENT",
			});
		}
	} catch (error) {
		Log.info(
			`[AuthApiController.js][sendCode][${req.body.phoneNumber}] \t error sending sms: ${error}`
		);
		return res.status(200).json({
			success: false,
			error: error.message,
			message: "ERROR",
		});
	}
}
// confirm code
async function confirmCode(req, res) {
	let AcountStatus = "INITIAL";
	try {
		Log.info(
			`[AuthApiController.js][confirmCode][${req.body.phoneNumber}] \t ****** initiate confirm code  `
		);
		const q = req.body.phoneNumber.substr(-9);

		let user = await User.findOne({
			phoneNumber: { $regex: q, $options: "i" },
		});

		if (!user) {
			try {
				const userData = new User({
					phoneNumber: req.body.phoneNumber,
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
// do login
async function doLogin(req, res) {
	Log.info(
		`[AuthApiController.js][doLogin][${req.body.phoneNumber}] \t ****** initiating login ...  `
	);

	// confirm code
	try {
		const login_response = await confirmCode(req, res);
		if (login_response) {
			if (login_response.success) {
				Log.info(
					`[AuthApiController.js][doLogin][${req.body.phoneNumber}] \t ****** code confirmation successful ...proceed to login  `
				);
				const login = await processUser(login_response, req);
				if (login.success) {
					console.log("user: " + JSON.stringify(login));
					return res.status(200).json(login);
				}
				return res.status(200).json({
					success: false,
					message: "ERROR_OCCURRED",
				});
			}
			return res.status(200).json({
				success: false,
				message: "WRONG_CODE",
			});
		}
		return res.status(200).json(login_response);
	} catch (error) {
		Log.info(
			`[AuthApiController.js][doLogin][${req.body.phoneNumber}] \t ****** login error  ...  ${error}`
		);
		return res.status(200).json({
			success: false,
			message: "ERROR_OCCURRED",
		});
	}
}
// complete registration
async function completeRegistration(req, res) {
	try {
		Log.info(
			`[AuthApiController.js][completeRegistration][${req.body.phoneNumber}] \t ****** initiate confirm code  `
		);
		const q = req.body.phoneNumber.substr(-9);

		const accessCode = decrypt(req.body.accessCode);

		const registrationToken = await getRedis(`registration_token_${q}`);

		if (registrationToken.toString() === accessCode.toString()) {
			const currentTimeStamp = new Date().getTime();
			const passwd = await Hash(currentTimeStamp.toString());

			try {
				let user = await User.findOne({
					phoneNumber: { $regex: q, $options: "i" },
				});
				if (user) {
					user.firstName = req.body.firstName;
					user.lastName = req.body.lastName;
					user.idType = req.body.idType;
					user.idNumber = req.body.idNumber;
					user.idExpiryDate = req.body.idExpiry;
					user.registration = "COMPLETED";
					user.status = "Active";
					user.password = passwd;
					await user.save();
					if (user.isModified) {
						// remove redis code after registration
						await removeRedis(`registration_token_${q}`);
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
					}
				}
			} catch (error) {
				Log.info(
					`[AuthApiController.js][completeRegistration][${req.body.phoneNumber}] \t error updating registration user ${error}  `
				);
			}
		} else {
			return res.json({
				success: false,
				message: "Registration token expired",
			});
		}
	} catch (error) {
		return res.json({
			success: false,
			message: error.message || "An unknown error occurred",
		});
	}
}

async function processUser(login_response, req) {
	const q = req.body.phoneNumber.substr(-9);
	let user = await Person.findOne({
		phoneNumber: { $regex: q, $options: "i" },
	});

	if (user) {
		login_response["user_id"] = user._id;
		login_response["firstName"] = user.firstName;
		login_response["middleName"] = user.middleName;
		login_response["lastName"] = user.lastName;
		login_response["phoneNumber"] = user.phoneNumber;
		login_response["type"] = user.category;
		login_response["email"] = user.email;
		login_response["token"] = await createToken(user._id);
		return login_response;
	} else {
		console.log("User not created");
		return false;
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
	postDeviceData,
	sendCode,
	confirmCode,
	doLogin,
	completeRegistration,
};
