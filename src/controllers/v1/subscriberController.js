const axios = require("axios");
const { validationResult } = require("express-validator");
const User = require("../../models/user");
const { Log } = require("../../helpers/Log");
const serviceCode = require("../../constants/serviceCode");

async function postSubscriber(req, res) {
	Log.info(
		`[subscriberController.js][postSubscriber]\t IP ${req.ip}`
	);
	const subscriber = new User({
		phoneNumber: req.body.msisdn,
		role: req.body.account_type,
		firstName: req.body.first_name,
		middleName: req.body.middle_name,
		lastName: req.body.last_name,
		email: req.body.email,
		status: req.body.status,
		accessMode: serviceCode.WHATSAPP,
	});

	subscriber
		.save()
		.then((result) => {
			console.log("Added subscriber");
			res.status(201).json({ success: true, mesage: "SUBSCRIBER_SAVED" });
		})
		.catch((err) => {
			console.log(err);
			return res
				.status(403)
				.json({ success: false, err, message: "ERROR_OCCURRED" });
		});
}

async function getAccountKyc(req, res) {
	Log.info(
		`[subscriberController.js][getAccountKyc]\t IP ${req.ip}`
	);
	Log.info(
		"[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : " +
			req.params.msisdn
	);
	try {
		let msisdn;
		msisdn = req.params.msisdn;

		Log.info("[SubscriberController.js][getSubscriber]\t ..msisdn : " + msisdn);

		let response = await Subscriber.findOne({ msisdn: msisdn });

		Log.info(
			`[SubscriberController.js][getSubscriber]\t ..response : ${JSON.stringify(
				response
			)}`
		);

		if (!response) {
			return res.status(404).json({ message: "Subscriber not found" });
		}

		response["success"] = true;
		response["code"] = "SUCCESS";

		res.json({
			data: response,
		});
	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function getAccountStatus(req, res) {
	Log.info(
		`[subscriberController.js][getAccountStatus]\t IP ${req.ip}`
	);
	Log.info(
		"[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : " +
			req.params.msisdn
	);
	try {
		const msisdn = req.params.msisdn;

		let response = await Subscriber.findOne(
			{ msisdn: msisdn },
			"status customer_name account_type"
		);

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

async function postValidatePin(req, res) {
	Log.info(
		`[subscriberController.js][postValidatePin]\t IP ${req.ip}`
	);
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

module.exports = {
	postSubscriber,
	getAccountKyc,
	getAccountStatus,
	postValidatePin,
	getAccountBalance,
	getAccountStatement,
	postChangePin,
};
