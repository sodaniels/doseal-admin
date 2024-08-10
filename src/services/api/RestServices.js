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
				`[HubtelController.js][postHubtelTelecelTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelTelecelTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelTelecelTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelTelecelTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelTelecelTopup] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// hubtel airtel tigo service
	async postHubtelAirtelTigoTopup(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_AIRTEL_TIGO_AIRTIME_SERVICE_ID}`,
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
				`[HubtelController.js][postHubtelAirtelTigoTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelAirtelTigoTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelAirtelTigoTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelAirtelTigoTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelAirtelTigoTopup] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// hubtel search ecg meter information
	async postHubtelEcgMeterSearchService(phoneNumber) {
		try {
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_ECG_PREPAID_POSTPAID_SERVICE_ID}?destination=${phoneNumber}`,
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
				`[HubtelController.js][postHubtelEcgMeterSearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelEcgMeterSearch] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelEcgMeterSearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelEcgMeterSearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelEcgMeterSearch] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post hubtel telecel service
	async postHubtelECGTopup(phoneNumber, meterId, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_ECG_PREPAID_POSTPAID_SERVICE_ID}`,
				{
					Destination: phoneNumber,
					Amount: Amount,
					CallbackURL: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-utility-services-callback`,
					ClientReference: ClientReference,
					Extradata: {
						bundle: meterId,
					},
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
				`[HubtelController.js][postHubtelECGTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelECGTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelECGTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelECGTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelECGTopup] unknown error: ${error.message}`
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
					callbackUrl: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-payment-callback`,
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
	// post dstv account search service
	async postHubtelDstvAccountSearchService(accountNumber) {
		try {
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_DSTV_SERVICE_ID}?destination=${accountNumber}`,
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
				`[HubtelController.js][postHubtelDstvAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelDstvAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelDstvAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelDstvAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelDstvAccountSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post pay dstv
	async postHubtelPayDstv(accountNumber, Amount, ClientReference) {
		try {
			Log.info(
				`[HubtelController.js][postHubtelPayDstv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase DSTV `
			);
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_DSTV_SERVICE_ID}`,
				{
					Destination: accountNumber,
					Amount: Amount,
					CallbackURL: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-utility-services-callback`,
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
				`[HubtelController.js][postHubtelPayDstv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelPayDstv] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelPayDstv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelPayDstv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelPayDstv] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// post gotv account search
	async postHubtelGoTVAccountSearchService(accountNumber) {
		try {
			Log.info(
				`[HubtelController.js][postHubtelGoTVAccountSearchService][${accountNumber}] intial  [POST] to search goTv account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_GOTV_SERVICE_ID}?destination=${accountNumber}`,
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
				`[HubtelController.js][postHubtelGoTVAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelGoTVAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelGoTVAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelGoTVAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelGoTVAccountSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post pay dstv
	async postHubtelPayGOtv(accountNumber, Amount, ClientReference) {
		try {
			Log.info(
				`[HubtelController.js][postHubtelPayGOtv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase DSTV `
			);
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_GOTV_SERVICE_ID}`,
				{
					Destination: accountNumber,
					Amount: Amount,
					CallbackURL: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-utility-services-callback`,
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
				`[HubtelController.js][postHubtelPayGOtv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelPayGOtv] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelPayGOtv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelPayGOtv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelPayGOtv] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// post star times tv account search
	async postHubtelStartTimeTVAccountSearchService(accountNumber) {
		try {
			Log.info(
				`[HubtelController.js][postHubtelStartTimeTVAccountSearchService][${accountNumber}] intial  [POST] to search star time tv account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_STAR_TIMES_TV_SERVICE_ID}?destination=${accountNumber}`,
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
				`[HubtelController.js][postHubtelStartTimeTVAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelStartTimeTVAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelStartTimeTVAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelStartTimeTVAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelStartTimeTVAccountSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post pay start times tv
	async postHubtelPayStarTimeTv(accountNumber, Amount, ClientReference) {
		try {
			Log.info(
				`[HubtelController.js][postHubtelPayStarTimeTv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase star times tv `
			);
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_STAR_TIMES_TV_SERVICE_ID}`,
				{
					Destination: accountNumber,
					Amount: Amount,
					CallbackURL: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-utility-services-callback`,
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
				`[HubtelController.js][postHubtelPayStarTimeTv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[HubtelController.js][postHubtelPayStarTimeTv] response status: ${error.response.status}`
				);
				Log.info(
					`[HubtelController.js][postHubtelPayStarTimeTv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[HubtelController.js][postHubtelPayStarTimeTv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[HubtelController.js][postHubtelPayStarTimeTv] unknown error: ${error.message}`
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
