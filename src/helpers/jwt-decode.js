const jwt = require('jsonwebtoken');
const { Log } = require("./Log");
require("dotenv").config();

async function JwtDecode(req, res) {
	const token = req.headers['token'];
	if (token) {
		try {
			const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
			let _id = decodedToken._id;
			Log.info('user _id from token: ' + _id);
			return _id;
		} catch (error) {
			return null;
		}
	}
	return null;

}

module.exports = {
	JwtDecode
}