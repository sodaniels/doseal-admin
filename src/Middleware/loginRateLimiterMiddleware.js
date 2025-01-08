const rateLimit = require("express-rate-limit");

const ServiceCode = require("../constants/serviceCode");
const BlockedIps = require("../models/blocked-ips.model");
const { Log } = require("../helpers/Log");

// Middleware to block IPs that are already blocked
const ipBlockerMiddleware = async (req, res, next) => {
	const incoming_ip = req.ip;
	const check_blocked_ips = await BlockedIps.findOne({
		ip: incoming_ip,
	}).lean();
	if (check_blocked_ips) {
        Log.info(
            `[loginRateLimiterMiddleware.js][ipBlockerMiddleware]\t Blocked IP ${req.ip}`
        );
		return res.status(403).json({ message: "Your IP is blocked." });
	}
	next();
};

// Rate limiter middleware
const loginRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 5, // Allow 5 login attempts per minute
	message: "Too many login attempts. Please wait a moment and try again.",
	handler: async (req, res, next) => {
		const incoming_ip = req.ip;

		const check_blocked_ips = await BlockedIps.findOne({
			ip: incoming_ip,
		}).lean();
		// Add IP to the ServiceCode.BLOCKED_IPD_ADDRESSES array if not already present
		if (!check_blocked_ips) {
            Log.info(
                `[loginRateLimiterMiddleware.js][ipBlockerMiddleware]\t Blocking IP ${req.ip}`
            );
			const ipObject = new BlockedIps({
				ip: incoming_ip,
			});
			const store_blocked_ip = await ipObject.save();
		}

		res.status(429).json({
			message: "Too many login attempts. Your IP has been blocked.",
		});
	},
	skipFailedRequests: false, // Ensure all requests count towards the limit
});

// Combine both middlewares into a single exportable middleware
const loginRateLimiterMiddleware = [ipBlockerMiddleware, loginRateLimiter];

module.exports = {
	loginRateLimiterMiddleware,
};
