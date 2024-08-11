const ensureAuthenticated = (req, res, next) => {
	if (req.user) {
		return next();
	}
	return res.json({ code: 401, message: "Unauthorized" });
};

module.exports = ensureAuthenticated;
