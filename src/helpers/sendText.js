const axios = require("axios");
require("dotenv").config();
const { Log } = require("../helpers/Log");

const str = `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`;
const token = Buffer.from(str).toString("base64");

async function sendText(number, message) {
	try {
		let phoneNumber = number.replace(/ /g, "");
		let q = phoneNumber.slice(-9);

		let sanitizedNumber;
		if (number.length === 9 || number.length === 10) {
			sanitizedNumber = "233" + q;
		} else {
			sanitizedNumber = number;
		}

		const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
		const clientId = process.env.HUBTEL_CLIENT_ID;
		const from = process.env.HUBTEL_SENDER;
		const to = sanitizedNumber;
		const content = message;

		Log.info(`[sendText.js][sendText]\t ... initializing send sms`);
		const response = await axios.get(
			`https://sms.hubtel.com/v1/messages/send?clientsecret=${clientSecret}&clientid=${clientId}&from=${from}&to=${to}&content=${content}`,
			{
				headers: {
					Authorization: `Basic ${token}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		Log.info(
			`[sendText.js][sendText]\t ... error occurred while sending text ${error}`
		);
	}
}

async function sendTextOld(number, message) {
	try {
		let phoneNumber = number.replace(/ /g, "");
		let q = phoneNumber.slice(-9);

		let sanitizedNumber;
		if (number.length === 9 || number.length === 10) {
			sanitizedNumber = "233" + q;
		} else {
			sanitizedNumber = number;
		}

		Log.info(`[sendText.js][sendText]\t ... initializing send sms`);
		const response = await axios.post(
			process.env.HUBTEL_BASE_URL,
			{
				from: process.env.HUBTEL_SENDER,
				to: sanitizedNumber,
				content: message,
			},
			{
				headers: {
					Authorization: `Basic ${token}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		Log.info(
			`[sendText.js][sendText]\t ... error occurred while sending text ${error}`
		);
	}
}

module.exports = { sendText };
