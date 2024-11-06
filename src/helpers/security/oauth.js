const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../../models/user");
const ApiUser = require("../../models/apiUser");
const { Log } = require("../../helpers/Log");
const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../helpers/redis");
const ServiceCode = require("../../constants/serviceCode");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const { decrypt, encrypt } = require("../../helpers/crypt");

// Define the route handler for token generation
router.post("/oauth/token", async (req, res) => {
	let clientSecret, clientId, decryptAuthCode;
	const { authCode, accessMode, deviceUniqueId } = req.body;

	console.log("req.body: ", req.body);

	try {
		decryptAuthCode = decrypt(authCode);
		Log.info(
			`[oauth.js][accedMode; ${accessMode}][]code decoded ${decryptAuthCode}`
		);
	} catch (error) {
		Log.info(`[oauth.js][accedMode; ${accessMode}] error decoding ${authCode}`);
		return res.status(500).json({ error: "Server error " + error });
	}

	Log.info(`[oauth.js][accedMode; ${accessMode}] ${req.ip}`);

	try {
		if (accessMode === "WEBSITE") {
			clientSecret = process.env.DOSEAL_WEP_APP_CLIENT_SECRET;
			clientId = process.env.DOSEAL_WEB_APP_CLIENT_ID;
		}
		if (accessMode === "MOBILE_APP") {
			clientSecret = process.env.DOSEAL_MOBILE_APP_CLIENT_SECRET;
			clientId = process.env.DOSEAL_MOBILE_APP_CLIENT_ID;
		}

		const api_user = await ApiUser.findOne({ clientId });

		if (!api_user || !bcrypt.compareSync(clientSecret, api_user.clientSecret)) {
			return res.status(200).json({ code: 401, message: "Unauthorized" });
		}

		let user = await User.findOne({ authCode: decryptAuthCode });
		if (!user) {
			return res.status(400).json({ error: "Invalid authorization code" });
		}

		// Generate access token
		const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN, {
			expiresIn: "1h",
		});

		console.log("accessToken: " + accessToken);

		if (user.registration === "INITIAL") {
			user.registration = "COMPLETED";
			user.status = "Active";
			user.lastloggedIn = Date.now();
			user.authCode = undefined;
			user.deviceUniqueId = deviceUniqueId ? deviceUniqueId : undefined;
			await user.save();
		} else {
			user.authCode = undefined;
			user.lastloggedIn = Date.now();
			user.deviceUniqueId = deviceUniqueId ? deviceUniqueId : undefined;
			await user.save();
		}

		if (accessMode === "WEBSITE") {
			Log.info(
				`[oauth.js][accedMode; ${accessMode}]\ website registration worked \t ${JSON.stringify(
					{
						success: true,
						_id: user._id,
						firstName: user.firstName ? user.firstName : undefined,
						lastName: user.lastName ? user.lastName : undefined,
						phoneNumber: user.phoneNumber ? user.phoneNumber : undefined,
						status: user.registration ? user.registration : undefined,
						access_token: `***********************************************`,
					}
				)}`
			);
			res.json({
				success: true,
				_id: user._id,
				firstName: user.firstName ? user.firstName : undefined,
				lastName: user.lastName ? user.lastName : undefined,
				phoneNumber: user.phoneNumber ? user.phoneNumber : undefined,
				status: user.registration ? user.registration : undefined,
				access_token: accessToken,
			});
		}
		if (accessMode === "MOBILE_APP") {
			return res.json({
				success: true,
				acccess_token: accessToken,
				_id: user._id,
				firstName: user.firstName ? user.firstName : undefined,
				lastName: user.lastName ? user.lastName : undefined,
				phoneNumber: user.phoneNumber ? user.phoneNumber : undefined,
				status: user.registration ? user.registration : undefined,
				nameFromTelco: user.nameFromTelco ? user.nameFromTelco : undefined,
			});
		}
	} catch (error) {
		Log.info(`[oauth.js][accedMode; ${accessMode}] error: ${error}`);
		return res.status(500).json({ error: "Server error " + error });
	}
});

module.exports = router;
