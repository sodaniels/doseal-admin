const axios = require("axios");
const { validationResult } = require("express-validator");
const { Log } = require("../../helpers/Log");
const Admin = require("../../models/admin.model");
const ContactUs = require("../../models/contact-us.model");
const Page = require("../../models/page.model");

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getIndex(req, res) {
	return res.render("web/index", {
		pageTitle: "Doseal Limited | Home Page",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getAboutUs(req, res) {
	return res.render("web/about-us", {
		pageTitle: "Doseal Limited | About Us",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getOurServices(req, res) {
	return res.render("web/services", {
		pageTitle: "Doseal Limited | Our Services",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getContactUs(req, res) {
	return res.render("web/contact-us", {
		pageTitle: "Doseal Limited | Contact Us",
		path: "/",
		errors: false,
		errorMessage: false,
		SITE_KEY: process.env.SITE_KEY,
		captcha: recaptcha.render(),
		csrfToken: req.csrfToken(),
	});
}

async function postContacUs(req, res) {
	const captchaResponse = req.body["g-recaptcha-response"];
	const secret_key = process.env.SECRET_KEY;

	if (!req.body["g-recaptcha-response"]) {
		return res.json({
			success: false,
			code: 401,
			message: "Please select the security check",
		});
	}

	try {
		const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${captchaResponse}`;
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				secret: secret_key,
				response: captchaResponse,
			}),
		};
		const response = await fetch(url, requestOptions);
		const googleResponse = await response.json();
		if (!googleResponse.success) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	} catch (error) {
		Log.info(`[webController.js][postContacUs] error: ${error}`);
		if (!req.body["g-recaptcha-response"]) {
			return res.json({
				success: false,
				code: 401,
				message: "reCAPTCHA verification failed. Please try again.",
			});
		}
	}

	try {
		const contactObject = new ContactUs({
			fullName: req.body.fullName,
			email: req.body.email,
			website: req.body.website,
			message: req.body.message,
		});

		const storeContactUs = await contactObject.save();
		if (storeContactUs) {
			return res.json({
				success: true,
				code: 200,
				message: "We have received your message. Thank you for choosing Doseal",
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "An error occurred while storing your information",
			});
		}
	} catch (error) {
		Log.info(`[webController.js][postContacUs] error: ${error}`);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while storing your information",
		});
	}
}

async function getPages(req, res) {
	const category = req.params.category;
	const slug = req.params.slug;
	console.log("category: " + category);

	const page = await Page.findOne({ category: category });

	console.log("page: " + JSON.stringify(page));

	return res.render("web/pages", {
		pageTitle: "Doseal Limited | Pages",
		path: "/",
		errors: false,
		errorMessage: false,
		page: page ? page : false,
		csrfToken: req.csrfToken(),
		page: page ? page : false,
	});
}

async function getDownloads(req, res) {
	return res.render("web/downloads", {
		pageTitle: "Doseal Limited | Downloads",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

module.exports = {
	getIndex,
	getContactUs,
	getAboutUs,
	getOurServices,
	postContacUs,
	getPages,
	getDownloads,
};
