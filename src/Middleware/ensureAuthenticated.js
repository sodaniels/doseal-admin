const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.status(401).json({ code: 401, message: "Unauthorized" });
};

module.exports = ensureAuthenticated;
