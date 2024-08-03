const axios = require("axios");
const { Log } = require("./Log");
const https = require("https");
require("dotenv").config();

class Helpers {
	constructor() { }

	async token() {
		let response;
		const client = axios.create({
			baseURL: process.env.SHOP_BASE_URL,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});

		try {
			Log.info(
				`Initiating [POST] request to ${process.env.SHOP_BASE_URL}/oauth/token ...`
			);
			Log.info(
				"... Request:" +
				JSON.stringify({
					client_id: `******************************* ${tenantId}`,
					client_secret: "********************************",
					grant_type: "***********************************",
					username: "********************************",
					password: "********************************",
				})
			);

			const startTime = Date.now();

			switch (tenantId.toString()) {
				// uk corridor
				case "1":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_UK_CLIENT_ID}`,
						client_secret: process.env.SHOP_UK_CLIENT_SECRET,
						username: process.env.SHOP_UK_USERNAME,
						password: process.env.SHOP_UK_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				// Barbados corridor
				case "5":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_BARBADOS_CLIENT_ID}`,
						client_secret: process.env.SHOP_BARBADOS_CLIENT_SECRET,
						username: process.env.SHOP_BARBADOS_USERNAME,
						password: process.env.SHOP_BARBADOS_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				case "8":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_CIV_CLIENT_ID}`,
						client_secret: process.env.SHOP_CIV_CLIENT_SECRET,
						username: process.env.SHOP_CIV_USERNAME,
						password: process.env.SHOP_CIV_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				// Zambia corridor
				case "17":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_ZAMBIA_CLIENT_ID}`,
						client_secret: process.env.SHOP_ZAMBIA_CLIENT_SECRET,
						username: process.env.SHOP_ZAMBIA_USERNAME,
						password: process.env.SHOP_ZAMBIA_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				// Sierra Leone corridor
				case "19":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_SIERRA_LEONE_CLIENT_ID}`,
						client_secret: process.env.SHOP_SIERRA_LEONE_CLIENT_SECRET,
						username: process.env.SHOP_SIERRA_LEONE_USERNAME,
						password: process.env.SHOP_ZSIERRA_LEONEPASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				case "20":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_CANADA_CLIENT_ID}`,
						client_secret: process.env.SHOP_CANADA_CLIENT_SECRET,
						username: process.env.SHOP_CANADA_USERNAME,
						password: process.env.SHOP_CANADA_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;

				case "100":
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_INTERNAL_QA_CLIENT_ID}`,
						client_secret: process.env.SHOP_INTERNAL_QA_CLIENT_SECRET,
						username: process.env.SHOP_INTERNAL_QA_USERNAME,
						password: process.env.SHOP_INTERNAL_QA_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
				default:
					response = await client.post("/oauth/token", {
						client_id: `${process.env.SHOP_CLIENT_ID}`,
						client_secret: process.env.SHOP_CLIENT_SECRET,
						username: process.env.SHOP_USERNAME,
						password: process.env.SHOP_PASSWORD,
						grant_type: process.env.SHOP_GRANT_TYPE,
					});
					break;
			}

			const json_response = response.data;
			const endTime = Date.now();
			Log.info("... Response Received");
			Log.info("Time Taken:", endTime - startTime);

			if (json_response) {
				Log.info("Token value set ...");
				return json_response.access_token;
			}
		} catch (error) {
			if (error.response) {
				console.error("Error Response:", error.response.data);
				return error.response.data;
			} else if (error.request) {
				console.error("Error Request:", error.request);
				return error.request;
			} else {
				console.error("Error:", error.message);
				return error.message;
			}
		}
	}


	randomString(length) {
		const alphanumericChars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let randomString = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
			randomString += alphanumericChars.charAt(randomIndex);
		}
		return randomString;
	}

}

module.exports = Helpers;
