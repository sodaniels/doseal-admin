const axios = require("axios");
const config = require("../../config/services");
const { Log } = require("../../helpers/Log");
require("dotenv").config();

class RestMiddlewareServices {
	async postSearchEcgAccount(data, token) {
		try {
			const url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-ecg-meter`;
			Log.info(
				`[RestMiddlewareServices.js][postSearchEcgAccount] initiating request to: ${url}`
			);
			const response = await axios.post(url, data, {
				headers: {
					Authorization: `Bearer ${token}`, // Use Bearer if required
					"Content-Type": "application/json",
				},
			});

			return response.data;
		} catch (error) {
			Log.info(
				`[RestMiddlewareServices.js][postSearchEcgAccount] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}
	async postTransactionInitiate(data, token) {
		try {
			const url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/transaction/initiate`;
			Log.info(
				`[RestMiddlewareServices.js][postSearchEcgAccount] initiating request to: ${url}`
			);
			const response = await axios.post(url, data, {
				headers: {
					Authorization: `Bearer ${token}`, // Use Bearer if required
					"Content-Type": "application/json",
				},
			});

			return response.data;
		} catch (error) {
			Log.info(
				`[RestMiddlewareServices.js][postSearchEcgAccount] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postSearchEcgAccount] unknown error: ${error.message}`
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

module.exports = RestMiddlewareServices;
