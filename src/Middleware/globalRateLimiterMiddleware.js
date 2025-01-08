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
            `[globalRateLimiterMiddleware.js][ipBlockerMiddleware]\t Blocked IP ${req.ip}`
        );
		return res.status(403).json({ message: "Your IP is blocked." });
	}
	next();
};

// Rate limiter middleware
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Allow 200 requests per IP
    message: "Too many requests, please try again later.",
	handler: async (req, res, next) => {
		const incoming_ip = req.ip;

		const check_blocked_ips = await BlockedIps.findOne({
			ip: incoming_ip,
		}).lean();
		// Add IP to the ServiceCode.BLOCKED_IPD_ADDRESSES array if not already present
		if (!check_blocked_ips) {
            Log.info(
                `[globalRateLimiterMiddleware.js][ipBlockerMiddleware]\t Blocking IP ${req.ip}`
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
const globalRateLimiterMiddleware = [ipBlockerMiddleware, globalRateLimiter];

module.exports = {
	globalRateLimiterMiddleware,
};
