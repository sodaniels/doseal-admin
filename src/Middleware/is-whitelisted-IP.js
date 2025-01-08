const { Log } = require("../helpers/Log");
const ServiceCode = require("../constants/serviceCode");

module.exports = (req, res, next) => {
	
	const requestIP = req.ip;
	Log.info(
		`[is-whitelisted-IP.js]\t incoming IP: ${requestIP}`
	);
	const allowedIPs = ServiceCode.ALLOWED_IP_ADDRESSES;
	if (allowedIPs.includes(requestIP)) {
		next(); // IP is allowed, continue to the next middleware/route
	} else {
		res.status(403).json({
			code: 403,
			message: "Access forbidden.",
		});
	}
};
