const axios = require("axios");
const User = require("../../models/user");
const { Log } = require("../../helpers/Log");
const Transactions = require("../../models/transaction.model");
const { rand8Id, randId } = require("../../helpers/randId");
const Subscriber = require("../../models/user");
const { setRedis, getRedis, removeRedis } = require("../../databases/redis");
const sendText = require("../../helpers/sendText");
const { v4: uuidv4 } = require("uuid");
let io = require("../../../socket");
const postSendOtpService = require("../../services/whatsapp/postSendOtpService");

async function postSubscriber(req, res) {}

async function getAccountStatus(req, res) {
	Log.info(
		"[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : " +
			req.params.phoneNumber
	);
	let response;
	try {
		let phoneNumber = req.params.phoneNumber.replace(/ /g, ""); // Remove all spaces from the phone number
		let phone = phoneNumber.slice(-9);

		response = await User.findOne({
			phoneNumber: { $regex: `.*${phone}$` },
		}).select("user_id status registered firstName middleName lastName type");

		if (!response) {
			return res.status(200).json({
				success: false,
				code: "UNREGISTERED_ACCOUNT",
				message: "Subscriber not found",
			});
		}

		res.json({
			data: response,
			code: "SUCCESS",
			success: true,
		});
	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function getAccountKyc(req, res) {
	Log.info(
		"[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : " +
			req.params.phoneNumber
	);
	let statusCounts;
	let phoneNumber = req.params.phoneNumber.replace(/ /g, ""); // Remove all spaces from the phone number
	try {
		let phone = phoneNumber.slice(-9);

		let response = await User.findOne({
			phoneNumber: { $regex: `.*${phone}$` },
		}).select("status registered firstName middleName lastName  user_id");

		if (!response) {
			return res.status(200).json({
				success: false,
				code: "UNREGISTERED_ACCOUNT",
				message: "Subscriber not found",
			});
		}

		let transactions = await Transactions.find({
			user_id: response.user_id,
		}).sort({
			createdAt: -1,
		});
		if (transactions.length > 0) {
			statusCounts = {
				Successful: 0,
				Failed: 0,
				Pending: 0,
			};
			transactions.forEach((transaction) => {
				if (transaction.status === "Successful") {
					statusCounts.Completed++;
				} else if (transaction.status === "Failed") {
					statusCounts.Failed++;
				} else if (transaction.status === "Pending") {
					statusCounts.Pending++;
				}
			});
		}

		res.json({
			data: response,
			requests: transactions ? transactions : [],
			statusCounts: statusCounts,
			code: "SUCCESS",
			success: true,
		});
	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}


async function postRequest(req, res) {
	Log.info("[postRequest.js]..saving request" + JSON.stringify(req.body));
	const requestId = rand8Id();
	let userId = req.body.user_id;

	const newRequest = new Request({
		request_id: requestId,
		user_id: userId,
		category: req.body.category,
		subCategory: req.body.subCategory,
		title: getTitleFromDescription(req.body.description),
		description: req.body.description,
		location: req.body.location,
		when: req.body.when,
		urgency: req.body.urgency,
		status: "Active",
		accessMode: "whatsapp",
	});

	try {
		const requestSaved = await newRequest.save();
		if (requestSaved) {
			try {
				const user = await User.findOne({ user_id: userId });
				const message =
					`New Request \n` +
					`Name : ${user.firstName} ${user.middleName} ${user.lastName}\n` +
					`Phone Number: ${user.phoneNumber} \n` +
					`Description: ${req.body.description} \n` +
					`Category: ${req.body.category} \n` +
					`Mode: Whatsapp`;

				Log.info("[postRequest.js][execute]..sending sms: " + message);
				// sendText('233244139937', message)
				// sendText('233209571797', message)
			} catch (error) {
				Log.info("[postRequest.js]..error sending sms: " + error);
			}

			return res.status(200).json({
				success: true,
				request_id: requestId,
			});
		} else {
			res.status(200).json({
				success: false,
			});
		}
	} catch (error) {
		Log.info("[postRequestService.js][execute]..error", error);
		return {
			success: false,
			error: error,
		};
	}
}

async function getRequests(req, res) {
	Log.info("[subscriberController.js][getRequests]..retrieving orders: ");

	try {
		const orders = await Request.find({ user_id: req.query.user_id })
			.sort({ createdAt: -1 })
			.select(
				"request_id category title description location status paymentStatus accessMode"
			);
		if (orders.length > 0) {
			return res.status(200).json(orders);
		} else {
			return res.status(404).json([]);
		}
	} catch (error) {
		Log.info("[subscriberController.js][getRequests]..error", error);
		return res.status(404).res([]);
	}
}

async function postEditProfile(req, res) {
	Log.info("[postRequest.js]..saving request" + JSON.stringify(req.body));
	let nameParts = splitFullName(req.body.fullName);

	let response = await User.findOneAndUpdate(
		{ user_id: req.body.user_id },
		{
			firstName: nameParts.firstName,
			middleName: nameParts.middleName,
			lastName: nameParts.lastName,
		},
		{
			new: true,
		}
	);

	if (response) {
		return res.status(200).json({
			success: true,
			message: "PROFILE_UPDATED",
		});
	}
	return res.status(200).join({
		success: false,
		message: "PROFILE_NOT_UPDATED",
	});
}

async function postSendOTP(req, res) {
	const response = await postSendOtpService.execute(req, res);
	if (response) {
		return res.status(200).json(response);
	}
	return res.status(400).json({
		success: false,
		message: "ERROR_OCCURRED",
	});
}

async function confirmOTP(req, res) {
	Log.info("[subscriberController.js][confirmOTP]..confirming code");

	try {
		let msisdn = req.body.msisdn.replace(/ /g, ""); // Remove all spaces from the phone number
		let q = msisdn.slice(-9); // Get the last 9 digits of the phone number
		const getCode = await getRedis(`registration_init_${q}`);
		Log.info(
			`[subscriberController.js][confirmOTP]..confirming code ${getCode}`
		);

		if (!getCode) {
			return res.status(200).json({
				success: false,
				message: "CODE_EXPIRED",
			});
		}
		if (getCode && getCode !== req.body.code) {
			Log.info("[subscriberController.js][confirmOTP]..wrong code entered");

			return res.status(200).json({
				success: false,
				message: "WRONG_CODE",
			});
		}
		if (getCode && getCode === req.body.code) {
			Log.info("[subscriberController.js][confirmOTP]..code confirmed");
			Log.info("[confirmOTP.js]..saving user" + JSON.stringify(req.body));
			removeRedis(`registration_init_${q}`);
			// create account

			let nameParts = splitFullName(req.body.fullName);

			const userId = uuidv4();
			const createAccount = new User({
				user_id: userId,
				phoneNumber: req.body.msisdn,
				firstName: nameParts.firstName,
				middleName: nameParts.middleName,
				lastName: nameParts.lastName,
				registered: true,
			});
			const savedUser = await createAccount.save();
			if (savedUser) {
				return res.status(200).json({
					success: true,
					code: "SUCCESS",
					message: "USER_SAVED",
				});
			} else {
				return res.status(200).json({
					success: false,
					message: "SAVING_ERROR",
				});
			}
		}
		return res.status(200).json({
			success: false,
			message: "CODE_CONFIRMATION_FAILED",
		});
	} catch (error) {
		Log.info("[confirmCode.js][execute]..error", error);
		console.log(error);
		return res.status(200).json({
			success: false,
			message: "ERROR_OCCURRED",
		});
	}
}

async function postName(req, res) {
	Log.info("[postRequest.js]..saving request" + JSON.stringify(req.body));

	let nameParts = splitFullName(req.body.fullName);

	const userId = uuidv4();

	const updatedUser = await User.findOneAndUpdate(
		{ user_id: userId },
		{
			phoneNumber: req.body.msisdn,
			firstName: nameParts.firstName,
			middleName: nameParts.middleName,
			lastName: nameParts.lastName,
			registered: true,
		},
		{ new: true, upsert: true }
	);
	if (updatedUser) {
		return res.status(200).json({
			success: true,
			code: "SUCCESS",
			message: "USER_SAVED",
		});
	} else {
		return res.status(200).json({
			success: false,
			message: "SAVING_ERROR",
		});
	}
}

async function confirmCode(req, res) {
	Log.info("[subscriberController.js][confirmCode]..confirming code");
	let vendor;
	try {
		let phoneNumber = req.body.msisdn.replace(/ /g, "");
		let phone = phoneNumber.slice(-9);
		const user = await User.findOne({ phoneNumber: { $regex: `.*${phone}$` } });
		vendor = await Vendor.findOne({ user_id: user.user_id });
	} catch (error) {}

	try {
		let msisdn = req.body.msisdn.replace(/ /g, ""); // Remove all spaces from the phone number
		let q = msisdn.slice(-9); // Get the last 9 digits of the phone number
		const getCode = await getRedis(`registration_init_${q}`);
		Log.info(
			`[subscriberController.js][confirmCode]..confirming code ${getCode}`
		);

		if (!getCode) {
			return res.status(200).json({
				success: false,
				message: "CODE_EXPIRED",
			});
		}
		if (getCode && getCode !== req.body.code) {
			Log.info("[subscriberController.js][confirmCode]..wrong code entered");

			return res.status(200).json({
				success: false,
				message: "WRONG_CODE",
			});
		}
		if (getCode && getCode === req.body.code) {
			Log.info("[subscriberController.js][confirmOTP]..code confirmed");
			Log.info("[confirmOTP.js]..saving user" + JSON.stringify(req.body));
			removeRedis(`registration_init_${q}`);

			return res.status(200).json({
				success: true,
				accountExists: vendor ? true : false,
				code: "SUCCESS",
			});
		}
		return res.status(200).json({
			success: false,
			message: "CODE_CONFIRMATION_FAILED",
		});
	} catch (error) {
		Log.info("[confirmCode.js][execute]..error", error);
		console.log(error);
		return res.status(200).json({
			success: false,
			message: "ERROR_OCCURRED",
		});
	}
}

async function postRegisterVendor(req, res) {
	let phoneNumber = req.body.phoneNumber.replace(/ /g, "");
	let phone = phoneNumber.slice(-9);

	let response = await User.findOne({ phoneNumber: { $regex: `.*${phone}$` } });

	if (response) {
		const storeVendor = await Vendor.findOneAndUpdate(
			{ user_id: response.user_id },
			{
				category: req.body.category,
				otherCategory: req.body.otherCategory,
				type: "Vendor",
				registered: true,
				date_of_birth: req.body.date_of_birth,
				idType: req.body.idType,
				idNumber: req.body.idNumber,
				physicalLocation: req.body.physicalLocation,
				businessName: req.body.businessName,
				businessContact: req.body.businessContact,
				businessAddress: req.body.businessAddress,
				user: response._id,
			},
			{ upsert: true, new: true }
		);

		if (storeVendor) {
			let userUpdated;
			try {
				userUpdated = await User.findOneAndUpdate(
					{ user_id: response.user_id },
					{ $set: { type: "Vendor" } },
					{ new: true }
				);
			} catch (error) {
				// Handle the error here
			}
			Log.info(
				`[subscriberController.js][execute]..updatedUser: ${storeVendor}`
			);
			return res.status(200).json({
				success: true,
				code: "SUCCESS",
				message: "VENDOR_REGISTERED",
				type: userUpdated.type,
			});
		}
	} else {
		return res.status(200).json({
			success: false,
			message: "SAVING_ERROR",
		});
	}
}

async function postValidatePin(req, res) {
	try {
		const msisdn = String(req.body.msisdn);
		const pin = String(req.body.pin);

		const subscriber = await Subscriber.findOne({ msisdn, pin });

		if (!subscriber) {
			return res.status(200).json({ success: false, message: "INVALID_PIN" });
		} else {
			return res.status(200).json({ success: true, message: "SUCCESS" });
		}
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
}

async function getAccountBalance(req, res) {
	Log.info(
		"[SubscriberController.js][getAccountBalance]\t ..retrieving subscriber account balance for : " +
			req.params.msisdn
	);
	try {
		const msisdn = String(req.body.msisdn);
		const pin = String(req.body.pin);

		const response = await Subscriber.findOne({ msisdn, pin }, "balance");

		if (!response) {
			return res.status(404).json({ message: "Subscriber not found" });
		}
		res.json({
			data: response,
			code: "SUCCESS",
			success: true,
		});
	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function getAccountStatement(req, res) {
	Log.info(
		"[SubscriberController.js][getAccountBalance]\t ..retrieving subscriber account balance for : " +
			req.params.msisdn
	);
	try {
		const msisdn = String(req.body.msisdn);

		const response = await Subscriber.findOne({ msisdn }, "statement");

		if (!response) {
			return res.status(404).json({ message: "No statement found" });
		}
		res.json({
			data: response,
			code: "SUCCESS",
			success: true,
		});
	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function postChangePin(req, res) {
	try {
		const msisdn = req.body.msisdn;
		const oldPin = req.body.old_pin;
		const newPin = req.body.new_pin;

		const subscriber = await Subscriber.findOne({ msisdn: msisdn });

		if (!subscriber) {
			return res
				.status(200)
				.json({ success: false, message: "Subscriber not found" });
		}

		if (subscriber.pin !== oldPin) {
			return res
				.status(200)
				.json({ success: false, message: "Invalid old PIN" });
		}

		subscriber.pin = newPin;
		await subscriber.save();

		return res
			.status(200)
			.json({ success: true, message: "PIN changed successfully" });
	} catch (error) {
		console.error(error);
		return res
			.status(200)
			.json({ success: false, message: "Internal server error" });
	}
}

function splitFullName(fullName) {
	const nameParts = fullName.split(" ");

	let firstName = "";
	let middleName = "";
	let lastName = "";

	if (nameParts.length === 1) {
		// Only one part, assume it's the first name
		firstName = nameParts[0];
	} else if (nameParts.length === 2) {
		// Two parts, assume the first is the first name and the second is the last name
		firstName = nameParts[0];
		lastName = nameParts[1];
	} else {
		// Three or more parts, assume the first is the first name, the last is the last name,
		// and the rest are the middle name(s)
		firstName = nameParts[0];
		lastName = nameParts[nameParts.length - 1];
		middleName = nameParts.slice(1, -1).join(" ");
	}

	return {
		firstName,
		middleName,
		lastName,
	};
}

function getTitleFromDescription(description) {
	const words = description.split(" ");
	if (words.length >= 6) {
		return words.slice(6).join(" ") + "...";
	} else {
		return description;
	}
}

module.exports = {
	postSubscriber,
	getAccountKyc,
	getAccountStatus,
	postRequest,
	getRequests,
	postEditProfile,
	postSendOTP,
	confirmOTP,
	postName,
	confirmCode,
	postRegisterVendor,
	postValidatePin,
	getAccountBalance,
	getAccountStatement,
	postChangePin,
};
