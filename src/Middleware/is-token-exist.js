module.exports = (req, res, next) => {
	if (!req.cookies.jwt) {
		return res.redirect('/signin')
	}
	next();
};
