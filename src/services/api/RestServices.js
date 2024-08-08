const axios = require("axios");
const config = require("../../config/services");
const { Log } = require("../../helpers/Log");
require("dotenv").config();

class RestServices {
	async postECGRequest(data) {
		try {
			// Ensure token is a valid Base64 encoded string
			const token = Buffer.from(
				`${process.env.USERNAME}:${process.env.PASSWORD}`
			).toString("base64");

			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_ECG_PREPAID_POSTPAID_SERVICE_ID}`,
				data,
				{
					headers: {
						Authorization: `Basic ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			return response.data;
		} catch (error) {
			Log.info(
				`[HubtelController.js][AccountValidation] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][AccountValidation] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][AccountValidation] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][AccountValidation] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][AccountValidation] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postHubtelMtnTopup(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_MTN_SERVICE_ID}`,
				{
					Destination: Destination,
					Amount: Amount,
					CallbackURL: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-airtime-callback`,
					ClientReference: ClientReference,
				},
				{
					headers: {
						Authorization: `Basic ${token()}`,
						"Content-Type": "application/json",
					},
				}
			);
			return response.data;
		} catch (error) {
			Log.info(
				`[HubtelController.js][postHubtelMtnTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelMtnTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelMtnTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelMtnTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelMtnTopup] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postHubtelPaymentService(
		totalAmount,
		description,
		returnUrl,
		clientReference,
		merchantAccountNumber,
		cancellationUrl
	) {
		try {
			const response = await axios.post(
				`${process.env.HUBTEL_CHECKOUT_BASE_URL}`,
				{
					totalAmount: totalAmount,
					description: description,
					returnUrl: returnUrl,
					clientReference: clientReference,
					merchantAccountNumber: merchantAccountNumber,
					cancellationUrl: cancellationUrl,
					callbackUrl: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-airtime-callback`,
				},
				{
					headers: {
						Authorization: `Basic ${token()}`,
						"Content-Type": "application/json",
					},
				}
			);
			return response.data;
		} catch (error) {
			Log.info(
				`[HubtelController.js][postHubtelPaymentService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelPaymentService] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelPaymentService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelPaymentService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelPaymentService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
}

function token() {
	const username = process.env.HUBTEL_USERNAME;
	const password = process.env.HUBTEL_PASSWORD;
	// Create the Base64 encoded string
	const authString = Buffer.from(`${username}:${password}`).toString("base64");
	return authString;
}

module.exports = RestServices;
