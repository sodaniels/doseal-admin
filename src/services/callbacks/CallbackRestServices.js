const axios = require("axios");

const config = require("../../config/services");
const { Log } = require("../../helpers/Log");
require("dotenv").config();

class CallbackServices {
	constructor() {
		this.baseUrl = config.base_url;
	}

	async postBusiness(
		businessName,
		physicalLocation,
		email,
		phoneNumber,
		client_reference
	) {
		const resource = "/business";
		const body = {
			businessName,
			physicalLocation,
			email,
			phoneNumber,
		};
		return this.makeRequest({
			resource,
			method: "POST",
			body,
			client_reference,
		});
	}

	async makeRequest(options) {
		Log.info(`[CallbackServices][makeRequest]\t token: *********************`);
		const { resource, method, body, client_reference } = options;
		const url = `${this.baseUrl}/api/v1/${resource}`;
		const headers = {
			"Content-Type": "application/json",
		};
		const data = {
			...body,
			client_reference,
		};

		try {
			const response = await axios({
				method,
				url,
				headers,
				data,
			});

			return response.data;
		} catch (error) {
			console.error("Error:", error.response.data);
			throw new Error("Request failed");
		}
	}
}

module.exports = CallbackServices;
