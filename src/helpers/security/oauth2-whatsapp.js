const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/user");
const ApiUser = require("../../models/apiUser");
const { Log } = require("../../helpers/Log");
require("dotenv").config();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Define the route handler for token generation
router.post("/oauth2-whatsapp/token", async (req, res) => {
	const { clientId, clientSecret } = req.body;

	try {
		const api_user = await ApiUser.findOne({ clientId });

		if (!api_user || !bcrypt.compareSync(clientSecret, api_user.clientSecret)) {
			return res.status(200).json({ code: 401, message: "Unauthorized" });
		}

        // let user = await User.findOne({ _id: user_id });
		// if (!user) {
		// 	return res.status(400).json({ error: "Invalid authorization code" });
		// }
		// Generate a token
		const payload = {
			_id: api_user._id,
		};
		const token = jwt.sign(payload, process.env.SESSION_SECRET, {
			expiresIn: process.env.EXPIRES_IN,
		});
		// Return the token as the response
		return res.json({ token });
	} catch (error) {
		return res.status(500).json({ error: "Server error " + error });
	}
});

module.exports = router;
