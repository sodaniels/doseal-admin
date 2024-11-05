const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../../models/user");
const ApiUser = require("../../models/apiUser");
const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../helpers/redis");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Define the route handler for token generation
router.post("/oauth/token", async (req, res) => {
	const { clientId, clientSecret, authCode } = req.body;
	try {
		const api_user = await ApiUser.findOne({ clientId });

		if (!api_user || !bcrypt.compareSync(clientSecret, api_user.clientSecret)) {
			return res.status(200).json({ code: 401, message: "Unauthorized" });
		}

		let user = await User.findOne({ authCode: authCode });
		if (!user) {
			return res.status(400).json({ error: "Invalid authorization code" });
		}

		// Generate access token
		const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN, {
			expiresIn: "1h",
		});

		if (user.registration === "INITIAL") {
			user.registration = "COMPLETED";
			user.status = "Active";
			user.lastloggedIn = Date.now();
			user.authCode = undefined;
			await user.save();
		} else {
			user.authCode = undefined;
			user.lastloggedIn = Date.now();
			await user.save();
		}

		res.json({
			success: true,
			_id: user._id,
			firstName: user.firstName ? user.firstName : undefined,
			lastName: user.lastName ? user.lastName : undefined,
			phoneNumber: user.phoneNumber ? user.phoneNumber : undefined,
			status: user.registration ? user.registration.status : undefined,
			access_token: accessToken,
		});
	} catch (error) {
		return res.status(500).json({ error: "Server error " + error });
	}
});

module.exports = router;
