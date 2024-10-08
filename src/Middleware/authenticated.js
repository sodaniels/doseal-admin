module.exports = (req, res, next) => {
	if (!req.session.isLoggedIn) {
		return res
			.status(403)
			.json({ success: false, message: "Unauthenticated" });
	}
	next();
};
