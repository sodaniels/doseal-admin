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
				`[RestMiddlewareServices.js][postTransactionInitiate] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postTransactionInitiate] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionInitiate] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postTransactionInitiate] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionInitiate] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionInitiate] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postTransactionExecute(data, token) {
		try {
			const url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/transaction/execute`;
			Log.info(
				`[RestMiddlewareServices.js][postTransactionExecute] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postTransactionExecute] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionExecute] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postTransactionExecute] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionExecute] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postTransactionExecute] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postSearchDataBundle(data, token) {
		try {
			const url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-data-bundle-by-network`;
			Log.info(
				`[RestMiddlewareServices.js][postSearchDataBundle] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postSearchDataBundle] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchDataBundle] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postSearchDataBundle] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postSearchDataBundle] request: ${error.request}`
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

	async postUtiltySearch(data, token) {
		let url;
		try {
			url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-dstv-account`;
			Log.info(
				`[RestMiddlewareServices.js][postUtiltySearch] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postUtiltySearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postGhanWaterSearch(data, token) {
		let url;
		try {
			url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-ghana-water-account`;
			Log.info(
				`[RestMiddlewareServices.js][postGhanWaterSearch] initiating request to: ${url}`
			);
			const response = await axios.post(url, data, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			return response.data;
		} catch (error) {
			Log.info(
				`[RestMiddlewareServices.js][postGhanWaterSearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postGhanWaterSearch] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postGhanWaterSearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postGhanWaterSearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postTelecelPostpaidSearch(data, token) {
		let url;
		try {
			url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-telecel-postpaid-bills`;
			Log.info(
				`[RestMiddlewareServices.js][postTelecelPostpaidSearch] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postTelecelPostpaidSearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postTelecelPostpaidSearch] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postTelecelPostpaidSearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postTelecelPostpaidSearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postUtiltySearch] unknown error: ${error.message}`
				);
			}
			return {
				success: false,
				code: 500,
				message: error.message,
			};
		}
	}

	async postTelecelBroadbandSearch(data, token) {
		let url;
		try {
			url = `${process.env.DOSEAL_API_BASE_URL}/api/v1/search-telecel-broadband`;
			Log.info(
				`[RestMiddlewareServices.js][postTelecelBroadbandSearch] initiating request to: ${url}`
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
				`[RestMiddlewareServices.js][postTelecelBroadbandSearch] error validating account: ${error.message}`
			);
			if (error.response) {
				Log.info(
					`[RestMiddlewareServices.js][postTelecelBroadbandSearch] response status: ${error.response.status}`
				);
				Log.info(
					`[RestMiddlewareServices.js][postTelecelBroadbandSearch] response data: ${JSON.stringify(
						error.response.data
					)}`
				);
			} else if (error.request) {
				Log.info(
					`[RestMiddlewareServices.js][postTelecelBroadbandSearch] request: ${error.request}`
				);
			} else {
				Log.info(
					`[RestMiddlewareServices.js][postTelecelBroadbandSearch] unknown error: ${error.message}`
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
