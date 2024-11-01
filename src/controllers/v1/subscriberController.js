const axios = require("axios");
const { validationResult } = require("express-validator");
const Subscriber = require('../../models/sg/Subscriber');
const { Log } = require("../../helpers/Log");



async function postSubscriber(req, res) {

	const subscriber = new Subscriber({
		msisdn: req.body.msisdn,
		source_of_income: req.body.source_of_income,
		account_id: req.body.account_id,
		category: req.body.category,
		account_type: req.body.account_type,
		referral_code: req.body.referral_code,
		title: req.body.title,
		email1: req.body.email1,
		email2: req.body.email2,
		addresses: req.body.addresses,
		identification: req.body.identification,
		registration_date: req.body.registration_date,
		suspended: req.body.suspended,
		fraud_locked: req.body.fraud_locked,
		first_name: req.body.first_name,
		middle_name: req.body.middle_name,
		last_name: req.body.last_name,
		legal_name: req.body.legal_name,
		occupation: req.body.occupation,
		nature_of_work: req.body.nature_of_work,
		birth_country: req.body.birth_country,
		gender: req.body.gender,
		nationality: req.body.nationality,
		date_of_birth: req.body.date_of_birth,
		status: req.body.status,

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
	Log.info('[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : ' + req.params.msisdn);
	try {
		let msisdn;
		msisdn = req.params.msisdn;

		Log.info('[SubscriberController.js][getSubscriber]\t ..msisdn : ' + msisdn);

		let response = await Subscriber.findOne({ msisdn: msisdn });

		Log.info(`[SubscriberController.js][getSubscriber]\t ..response : ${JSON.stringify(response)}`);

		if (!response) {
			return res.status(404).json({ message: "Subscriber not found" });
		}

		response['success'] = true;
		response['code'] = 'SUCCESS';

		res.json({
			data: response
		});

	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function getAccountStatus(req, res) {
	Log.info('[SubscriberController.js][getSubscriber]\t ..retrieving subscriber with : ' + req.params.msisdn);
	try {
		const msisdn = req.params.msisdn;

		let response = await Subscriber.findOne({ msisdn: msisdn }, 'status customer_name account_type');

		if (!response) {
			return res.status(404).json({ message: "Subscriber not found" });
		}

		res.json({
			data: response,
			code: 'SUCCESS',
			success: true
		});

	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function postValidatePin(req, res) {
	try {
		const msisdn = String(req.body.msisdn);
		const pin = String(req.body.pin);

		const subscriber = await Subscriber.findOne({ msisdn, pin });

		if (!subscriber) {
			return res.status(200).json({ success: false, message: 'INVALID_PIN' });
		} else {
			return res.status(200).json({ success: true, message: 'SUCCESS' });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

async function getAccountBalance(req, res) {
	Log.info('[SubscriberController.js][getAccountBalance]\t ..retrieving subscriber account balance for : ' + req.params.msisdn);
	try {

		const msisdn = String(req.body.msisdn);
		const pin = String(req.body.pin);

		const response = await Subscriber.findOne({ msisdn, pin }, 'balance');

		if (!response) {
			return res.status(404).json({ message: "Subscriber not found" });
		}
		res.json({
			data: response,
			code: 'SUCCESS',
			success: true
		});

	} catch (error) {
		console.error("Error retrieving subscriber:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

async function getAccountStatement(req, res) {
	Log.info('[SubscriberController.js][getAccountBalance]\t ..retrieving subscriber account balance for : ' + req.params.msisdn);
	try {

		const msisdn = String(req.body.msisdn);

		const response = await Subscriber.findOne({ msisdn }, 'statement');

		if (!response) {
			return res.status(404).json({ message: "No statement found" });
		}
		res.json({
			data: response,
			code: 'SUCCESS',
			success: true
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
		return res.status(200).json({ success: false, message: 'Subscriber not found' });
	  }
  
	  if (subscriber.pin !== oldPin) {
		return res.status(200).json({ success: false, message: 'Invalid old PIN' });
	  }
  
	  subscriber.pin = newPin;
	  await subscriber.save();
  
	  return res.status(200).json({ success: true, message: 'PIN changed successfully' });
	} catch (error) {
	  console.error(error);
	  return res.status(200).json({ success: false, message: 'Internal server error' });
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
