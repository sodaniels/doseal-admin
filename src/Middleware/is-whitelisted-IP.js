const { Log } = require("../helpers/Log");

module.exports = (req, res, next) => {
	
	const requestIP = req.ip;
	Log.info(
		`[is-whitelisted-IP.js]\t incoming IP: ${requestIP}`
	);
	// const allowedIPs = process.env.ALLOWED_IPs;
	// if (allowedIPs.includes(requestIP)) {
	// 	next(); // IP is allowed, continue to the next middleware/route
	// } else {
	// 	res.status(403).json({
	// 		code: 403,
	// 		message: "Access forbidden.",
	// 	});
	// }
	next();
};
