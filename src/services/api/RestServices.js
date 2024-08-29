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
				`[RestServices.js][AccountValidation] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][AccountValidation] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][AccountValidation] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][AccountValidation] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][AccountValidation] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelMtnTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelMtnTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelMtnTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelMtnTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelMtnTopup] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelTelecelTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelTelecelTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelTelecelTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelTelecelTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelTelecelTopup] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelAirtelTigoTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoTopup] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelEcgMeterSearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelEcgMeterSearch] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelEcgMeterSearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelEcgMeterSearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelEcgMeterSearch] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelECGTopup] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelECGTopup] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelECGTopup] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelECGTopup] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelECGTopup] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelPaymentService][${amount}][${description}][${clientReference}] initiate [POST] request to : ${url}`
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
				`[RestServices.js][postHubtelPaymentService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelPaymentService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelPaymentService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
				Log.info(`[RestServices.js][postHubtelPaymentService] error: `, error);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelPaymentService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelPaymentService] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelDstvAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelDstvAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelDstvAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelDstvAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelDstvAccountSearchService] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelPayDstv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase DSTV `
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
				`[RestServices.js][postHubtelPayDstv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelPayDstv] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelPayDstv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelPayDstv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelPayDstv] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelGoTVAccountSearchService][${accountNumber}] intial  [POST] to search goTv account `
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
				`[RestServices.js][postHubtelGoTVAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelGoTVAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelGoTVAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelGoTVAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelGoTVAccountSearchService] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelPayGOtv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase DSTV `
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
				`[RestServices.js][postHubtelPayGOtv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelPayGOtv] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelPayGOtv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelPayGOtv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelPayGOtv] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelStartTimeTVAccountSearchService][${accountNumber}] intial  [POST] to search star time tv account `
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
				`[RestServices.js][postHubtelStartTimeTVAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelStartTimeTVAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelStartTimeTVAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelStartTimeTVAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelStartTimeTVAccountSearchService] unknown error: ${error.message}`
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
				`[RestServices.js][postHubtelPayStarTimeTv][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase star times tv `
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
				`[RestServices.js][postHubtelPayStarTimeTv] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelPayStarTimeTv] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelPayStarTimeTv] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelPayStarTimeTv] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelPayStarTimeTv] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// post ghana water account search
	async postHubtelGhanaWaterAccountSearchService(accountNumber, phoneNumber) {
		try {
			Log.info(
				`[RestServices.js][postHubtelGhanaWaterAccountSearchService][${accountNumber}][${phoneNumber}] intial  [POST] to search ghana water account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_GHANA_WATER_SERVICE_ID}?destination=${accountNumber}&mobile=${phoneNumber}`,
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
				`[RestServices.js][postHubtelGhanaWaterAccountSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelGhanaWaterAccountSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelGhanaWaterAccountSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelGhanaWaterAccountSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelGhanaWaterAccountSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	//post pay hubtel ghana water
	async postHubtelPayGhanaWater(
		accountNumber,
		Amount,
		phoneNumber,
		ClientReference,
		sessionId
	) {
		try {
			Log.info(
				`[RestServices.js][postHubtelPayGhanaWater][${accountNumber}][${Amount}][${ClientReference}] intial  [POST] to purchase ghana water `
			);
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_GHANA_WATER_SERVICE_ID}`,
				{
					Destination: phoneNumber,
					Amount: Amount,
					Extradata: {
						bundle: accountNumber,
						Email: "info@doseal.org",
						SessionId: sessionId,
					},
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
				`[RestServices.js][postHubtelPayGhanaWater] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelPayGhanaWater] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelPayGhanaWater] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelPayGhanaWater] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelPayGhanaWater] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	/**SEARCH DATA BUNDLE */
	// post search mtn bundle
	async postMtnDataSearchService(accountNumber) {
		try {
			Log.info(
				`[RestServices.js][postMtnDataSearchService][${accountNumber}] intial  [POST] to search mtn bundle account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_MTN_DATA_SERVICE_ID}?destination=${accountNumber}`,
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
				`[RestServices.js][postMtnDataSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postMtnDataSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postMtnDataSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postMtnDataSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postMtnDataSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post telelcel data bundle search
	async postTelecelDataSearchService(accountNumber) {
		try {
			Log.info(
				`[RestServices.js][postTelecelDataSearchService][${accountNumber}] intial  [POST] to search telecel bundle account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_TELECEL_DATA_SERVICE_ID}?destination=${accountNumber}`,
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
				`[RestServices.js][postTelecelDataSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postTelecelDataSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postTelecelDataSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postTelecelDataSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postTelecelDataSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post airtel tigo data bundle search
	async postAirtelTigoDataSearchService(accountNumber) {
		try {
			Log.info(
				`[RestServices.js][postAirtelTigoDataSearchService][${accountNumber}] intial  [POST] to airtel tigo data bundle account `
			);
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_AIRTEL_TIGO_DATA_SERVICE_ID}?destination=${accountNumber}`,
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
				`[RestServices.js][postAirtelTigoDataSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postAirtelTigoDataSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postAirtelTigoDataSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postAirtelTigoDataSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postAirtelTigoDataSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	/**SEARCH DATA BUNDLE */
	/**PAY DATA BUNDLE */
	// post mtn data bundle
	async postHubtelMtnDataBundle(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_MTN_DATA_SERVICE_ID}`,
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
				`[RestServices.js][postHubtelMtnDataBundle] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelMtnDataBundle] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelMtnDataBundle] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelMtnDataBundle] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelMtnDataBundle] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// post telecel data data bundle
	async postHubtelTelecelDataBundle(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_TELECEL_DATA_SERVICE_ID}`,
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
				`[RestServices.js][postHubtelTelecelDataBundle] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelTelecelDataBundle] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelTelecelDataBundle] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelTelecelDataBundle] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelTelecelDataBundle] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	// post airtel tigo data bundle
	async postHubtelAirtelTigoDataBundle(Destination, Amount, ClientReference) {
		try {
			const response = await axios.post(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_AIRTEL_TIGO_DATA_SERVICE_ID}`,
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
				`[RestServices.js][postHubtelAirtelTigoDataBundle] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoDataBundle] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoDataBundle] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoDataBundle] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelAirtelTigoDataBundle] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	/**PAY DATA BUNDLE */
	// post transaction status check
	async getTransactionStatusCheckService(clientReference) {
		try {
			const url = `https://api-txnstatus.hubtel.com/transactions/${process.env.HUBTEL_POS_SALES_ID}/status?clientReference=${clientReference}`;
			Log.info(
				`[RestServices.js][getTransactionStatusCheckService][${clientReference}] intial  [GET] to ${url}`
			);

			const response = await axios.get(url, {
				headers: {
					Authorization: `Basic ${token()}`,
					"Content-Type": "application/json",
				},
			});
			return response.data;
		} catch (error) {
			Log.info(
				`[RestServices.js][getTransactionStatusCheckService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][getTransactionStatusCheckService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][getTransactionStatusCheckService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][getTransactionStatusCheckService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][getTransactionStatusCheckService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// get balance query request
	async getPosBalanceQueryService() {
		try {
			const url = `https://trnf.hubtel.com/api/inter-transfers/${process.env.HUBTEL_POS_SALES_ID}`;
			Log.info(
				`[RestServices.js][getBalanceQueryService] intial  [GET] to ${url}`
			);

			const response = await axios.get(url, {
				headers: {
					Authorization: `Basic ${token()}`,
					"Content-Type": "application/json",
				},
			});
			return response.data;
		} catch (error) {
			Log.info(
				`[RestServices.js][getBalanceQueryService] error getting balance query: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][getBalanceQueryService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][getBalanceQueryService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][getBalanceQueryService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][getBalanceQueryService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// get prepaid balance query
	async getPrepaidBalanceQueryService() {
		try {
			const url = `https://trnf.hubtel.com/api/inter-transfers/prepaid/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}`;
			Log.info(
				`[RestServices.js][getPrepaidBalanceQueryService] intial  [GET] to ${url}`
			);

			const response = await axios.get(url, {
				headers: {
					Authorization: `Basic ${token()}`,
					"Content-Type": "application/json",
				},
			});
			return response.data;
		} catch (error) {
			Log.info(
				`[RestServices.js][getPrepaidBalanceQueryService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][getPrepaidBalanceQueryService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][getPrepaidBalanceQueryService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][getPrepaidBalanceQueryService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][getPrepaidBalanceQueryService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// post balance transfer
	async postTransferBalance(Amount, ClientReference) {
		try {
			const url = `https://trnf.hubtel.com/api/inter-transfers/${process.env.HUBTEL_POS_SALES_ID}`;
			Log.info(
				`[RestServices.js][postTransferBalance] intial  [POST] to ${url}`
			);

			const response = await axios.post(
				url,
				{
					Amount: Amount,
					Description: `Doseal Balance Transfer`,
					DestinationAccountNumber: `${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}`,
					ClientReference: ClientReference,
					PrimaryCallbackUrl: `${process.env.HUBTEL_CALLBACK_BASE_URL}/api/v1/hubtel-balance-transfer-callback`,
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
				`[RestServices.js][postTransferBalance] error transfering balance: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postTransferBalance] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postTransferBalance] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postTransferBalance] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postTransferBalance] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// hubtel search ecg meter information
	async postHubtelMSISDNSearchService(phoneNumber) {
		try {
			const response = await axios.get(
				`https://cs.hubtel.com/commissionservices/${process.env.HUBTEL_PREPAID_DEPOSTI_ACCOUNT}/${process.env.HUBTEL_MSISDN_SERVICE_ID}?destination=${phoneNumber}`,
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
				`[RestServices.js][postHubtelMSISDNSearchService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelMSISDNSearchService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelMSISDNSearchService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelMSISDNSearchService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelMSISDNSearchService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
			};
		}
	}
	// hutbel ID card validation
	async postHubtelIDCardValidationService(idtype, idnumber) {
		try {
			const response = await axios.get(
				`https://rnv.hubtel.com/v2/merchantaccount/merchants/${process.env.HUBTEL_POS_SALES_ID}/idcard/verify?idtype=${idtype}&idnumber=${idnumber}`,
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
				`[RestServices.js][postHubtelIDCardValidationService] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestServices.js][postHubtelIDCardValidationService] response status: ${error.response.status}`
				);
				Log.info(
					`[RestServices.js][postHubtelIDCardValidationService] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestServices.js][postHubtelIDCardValidationService] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestServices.js][postHubtelIDCardValidationService] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.response.data ? error.response.data : error.response,
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
