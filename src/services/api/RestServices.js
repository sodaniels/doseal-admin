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
	// hubtel mtn topup service
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
	// hubtel telecel service
	async postHubtelTelecelTopup(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_TELECEL_SERVICE_ID}`,
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

	async postHubtelPaymentService(amount, description, clientReference) {
		try {
			const url = `${process.env.HUBTEL_CHECKOUT_BASE_URL}`;
			Log.info(
				`[HubtelController.js][postHubtelPaymentService][${amount}][${description}][${clientReference}] initiate [POST] request to : ${url}`
			);
			const response = await axios.post(
				url,
				{
					totalAmount: amount,
					description: description,
					returnUrl: `${process.env.HUBTEL_RETURN_URL}`,
					clientReference: clientReference,
					merchantAccountNumber: `${process.env.HUBTEL_POS_SALES_ID}`,
					cancellationUrl: `${process.env.HUBTEL_CANCELLATION_URL}`,
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
				Log.info(
					`[HubtelController.js][postHubtelPaymentService] error: `,
					error
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
