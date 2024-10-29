const axios = require("axios");
const { validationResult } = require("express-validator");
const { Log } = require("../../helpers/Log");
const Admin = require("../../models/admin.model");


async function getIndex(req, res) {
	return res.render("web/index", {
		pageTitle: "Doseal Limited | Home Page",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function agetAboutUs(req, res) {
	return res.render("web/about-us", {
		pageTitle: "Doseal Limited | About Us",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}


async function postLogin(req, res) {
	let user;

	Log.info(`[postSignin] \t initiating.. post request to login`);

	const errors = validationResult(req);
	console.log(errors.array());
	if (!errors.isEmpty()) {
		return res.status(422).render("dashboard/auth/login", {
			pageTitle: "Login",
			path: "/login",
			errors: errors.array(),
			errorMessage: false,
			sessionId: req.body.sessionId,
			csrfToken: req.csrfToken(),
		});
	}
	const email = req.body.email;
	const pw = req.body.password;

	Admin.findOne({ email: email })
		.then((iUser) => {
			user = iUser;
			if (!user) {
				// User not found
				return res.status(422).render("dashboard/auth/login", {
					pageTitle: "Login",
					errors: false,
					path: "/login",
					errorMessage: "Incorrect email and password combination",
					csrfToken: req.csrfToken(),
				});
			}
			return bcrypt.compare(pw, iUser.password);
		})
		.then((result) => {
			if (!result) {
				// Password does not match
				return res.status(422).render("dashboard/auth/login", {
					pageTitle: "Login",
					errors: false,
					path: "/login",
					errorMessage: "Incorrect email and password combination",
					csrfToken: req.csrfToken(),
				});
			}
			const token = createToken();
			const iUser = {
				firstName: user.firstName,
				middleName: user.middleName,
				lastName: user.lastName,
				role: user.role,
				email: user.email,
				user_id: user.userId,
				_id: user._id,
			};

			req.session.isLoggedIn = true;
			req.session.user = iUser;

			res.redirect("../dashboard");
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).send("Server Error");
		});
}


module.exports = {
	getIndex,
	agetAboutUs,
	postLogin,
};
