const axios = require("axios");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Transaction = require("../../models/transaction.model");
const { Log } = require("../../helpers/Log");
const Admin = require("../../models/admin.model");
const ContactUs = require("../../models/contact-us.model");
const Page = require("../../models/page.model");
const { handleValidationErrors } = require("../../helpers/validationHelper");
const { longDate } = require("../../helpers/shortData");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const ServiceCode = require("../../constants/serviceCode");

const {
	getRedis,
	setRedis,
	removeRedis,
	setRedisWithExpiry,
} = require("../../helpers/redis");

const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();

const RestMiddlewareServices = require("../../services/api/RestMiddlewareServices");
const restMiddlewareServices = new RestMiddlewareServices();

const { RecaptchaV2 } = require("express-recaptcha");
var recaptcha = new RecaptchaV2(process.env.SITE_KEY, process.env.SECRET_KEY);

async function getIndex(req, res) {
	Log.info(
		`[webController.js][getIndex] visitation on Index page IP: ${req.ip}`
	);
	return res.render("web/index", {
		pageTitle: "Doseal Limited | Home Page",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getAboutUs(req, res) {
	Log.info(
		`[webController.js][getAboutUs] visitation on About page IP: ${req.ip}`
	);
	return res.render("web/about-us", {
		pageTitle: "Doseal Limited | About Us",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getOurServices(req, res) {
	Log.info(
		`[webController.js][getOurServices] visitation on Services page IP: ${req.ip}`
	);
	return res.render("web/services", {
		pageTitle: "Doseal Limited | Our Services",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getContactUs(req, res) {
	Log.info(
		`[webController.js][getContactUs] visitation on Contact Us page IP: ${req.ip}`
	);
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
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_CONTACT_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	Log.info(
		`[webController.js][postContacUs][${req.ip}] posting contact information IP: ` +
			JSON.stringify({
				fullName: req.body.fullName,
				email: req.body.email,
				website: req.body.website,
				message: req.body.message,
			})
	);
	const captchaResponse = req.body["g-recaptcha-response"];
	const secret_key = process.env.SECRET_KEY;

	if (!req.body["g-recaptcha-response"]) {
		return res.json({
			success: false,
			code: 401,
			message: "Please select the checkbox to indicate you are a human",
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
	Log.info(
		`[webController.js][getPages] visitation on ${req.params.category} page IP: ${req.ip}`
	);

	const category = req.params.category;
	const slug = req.params.slug;
	console.log("category: " + category);

	const page = await Page.findOne({ category: category });

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
	Log.info(
		`[webController.js][getDownloads] visitation on Downloads page IP: ${req.ip}`
	);
	return res.render("web/downloads", {
		pageTitle: "Doseal Limited | Downloads",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getPayBill(req, res) {
	Log.info(
		`[webController.js][getPayBill] visitation on Pay Bill page IP: ${req.ip}`
	);
	return res.render("web/services/pay-bill", {
		pageTitle: "Doseal Limited | Pay Bill",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function getServiceSearch(req, res) {
	Log.info(
		`[webController.js][getServiceSearch] visitation on ECG Search page IP: ${req.ip}`
	);
	return res.render("web/services/ecg-search", {
		pageTitle: "Doseal Limited | Pay Bill",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function postServiceSearch(req, res) {
	let inputData;
	const { phoneNumber, network = null, type = null } = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ECG_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		switch (type) {
			case "ECG":
				Log.info(
					`[ApiController.js][postServiceSearch]\t incoming ecg meter search request: ` +
						req.ip
				);
				inputData = {
					phoneNumber: phoneNumber,
					network: network ? network : undefined,
				};

				hubtelResponse = await restMiddlewareServices.postSearchEcgAccount(
					inputData,
					token
				);
				break;
			case "DATA":
				Log.info(
					`[ApiController.js][postServiceSearch]\t incoming data bundle search request: ` +
						req.ip
				);

				inputData = {
					accountNumber: phoneNumber,
					network: network ? network : undefined,
				};

				hubtelResponse = await restMiddlewareServices.postSearchDataBundle(
					inputData,
					token
				);
				break;

			default:
				break;
		}

		if (hubtelResponse) {
			// console.log("hubtelResponse: " + JSON.stringify(hubtelResponse));
			if (hubtelResponse.ResponseCode === "0000") {
				return res.json({
					success: true,
					code: 200,
					message: "Successful",
					phoneNumber: phoneNumber,
					data: hubtelResponse.Data,
				});
			}
			return res.json({
				success: false,
				code: 400,
				data: [],
			});
		}
		return res.json({
			success: false,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}

async function postTransactionInitiate(req, res) {
	const {
		phoneNumber,
		meterId = null,
		amount,
		type,
		meterName = null,
		network = null,
		accountName = null,
		accountNumber = null,
	} = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ECG_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		Log.info(
			`[ApiController.js][postTransactionInitiate]\t incoming transaction init request: ` +
				req.ip
		);

		const data = {
			phoneNumber: phoneNumber,
			meterId: meterId ? meterId : undefined,
			meterName: meterName ? meterName : undefined,
			network: network ? network : undefined,
			accountName: accountName ? accountName : undefined,
			accountNumber: accountNumber ? accountNumber : undefined,
			amount: amount,
			type: type,
		};

		console.log("initializing datq: " + JSON.stringify(data));

		hubtelResponse = await restMiddlewareServices.postTransactionInitiate(
			data,
			token
		);
		Log.info(
			`[ApiController.js][postTransactionInitiate]\t HubtelResponse: ` +
				JSON.stringify(hubtelResponse)
		);
		if (hubtelResponse) {
			const q = phoneNumber.substr(-9);
			const redisKey = `payment_checksum_${q}`;
			await setRedisWithExpiry(redisKey, 300, hubtelResponse.checksum);

			if (hubtelResponse.code === 200) {
				return res.json({
					success: true,
					code: 200,
					message: "Successful",
					data: hubtelResponse.result,
				});
			}
			return res.json({
				success: false,
				code: 400,
			});
		}
		return res.json({
			success: false,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}

async function postTransactionExecute(req, res) {
	const { type, phoneNumber } = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ECG_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		Log.info(
			`[ApiController.js][postTransactionExecute]\t incoming transaction exec request: ` +
				req.ip
		);

		const q = phoneNumber.substr(-9);
		const checksum = await getRedis(`payment_checksum_${q}`);

		const data = {
			checksum: checksum,
			type: type,
		};
		console.log("data: " + JSON.stringify(data));

		hubtelResponse = await restMiddlewareServices.postTransactionExecute(
			data,
			token
		);
		Log.info(
			`[ApiController.js][postTransactionExecute]\t hubtelResponse: ` +
				JSON.stringify(hubtelResponse)
		);
		if (hubtelResponse && hubtelResponse.responseCode === "0000") {
			const data = hubtelResponse.data;
			return res.json({
				success: true,
				code: 200,
				url: data.checkoutUrl,
			});
		}
		return res.json({
			success: false,
			code: 400,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}

/**airtime and bundle */
async function getAirtime(req, res) {
	Log.info(
		`[webController.js][getAirtime] visitation on Airtime page IP: ${req.ip}`
	);
	return res.render("web/services/airtime-and-data", {
		pageTitle: "Doseal Limited | Airtime and Data Bundle",
		path: "/",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
	});
}

async function postServiceDataSearch(req, res) {
	const { phoneNumber, network } = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_DATA_BUNDLE_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		Log.info(
			`[ApiController.js][postServiceDataSearch]\t incoming data bundle account search request: ` +
				req.ip
		);

		const data = {
			accountNumber: phoneNumber,
			network: network,
		};

		hubtelResponse = await restMiddlewareServices.postSearchDataBundle(
			data,
			token
		);
		if (hubtelResponse) {
			if (hubtelResponse.ResponseCode === "0000") {
				return res.json({
					success: true,
					code: 200,
					message: "Successful",
					phoneNumber: phoneNumber,
					data: hubtelResponse.Data,
				});
			}
			return res.json({
				success: false,
				code: 400,
				data: [],
			});
		}
		return res.json({
			success: false,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}

// dstv and others
async function getSearchUtilityService(req, res) {
	Log.info(
		`[webController.js][getSearchUtilityService] visitation on Utility Service page IP: ${req.ip}`
	);
	const user = req.session.user;
	return res.render("web/services/dstv-and-others", {
		pageTitle: "Doseal Limited | Utility Service",
		path: "/",
		errors: false,
		errorMessage: false,
		phoneNumber: user.phoneNumber,
		csrfToken: req.csrfToken(),
	});
}
// search for dstv and other services
async function postUtilityServiceSearch(req, res) {
	Log.info(
		`[webController.js][postUtilityServiceSearch] posting utility service: ${req.ip}`
	);
	let inputData;
	const { accountNumber, type = null } = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ECG_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		inputData = {
			accountNumber: accountNumber,
			type: type,
		};

		hubtelResponse = await restMiddlewareServices.postUtiltySearch(
			inputData,
			token
		);
		if (hubtelResponse) {
			console.log("hubtelResponse: " + JSON.stringify(hubtelResponse));
			if (hubtelResponse.ResponseCode === "0000") {
				return res.json({
					success: true,
					code: 200,
					message: "Successful",
					accountNumber: accountNumber,
					data: hubtelResponse.Data,
				});
			}
			return res.json({
				success: false,
				code: 400,
				data: [],
			});
		}
		return res.json({
			success: false,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// get ghana water
async function getGhanaWater(req, res) {
	Log.info(
		`[webController.js][getGhanaWater] visitation on Ghana Water Page page IP: ${req.ip}`
	);
	const user = req.session.user;
	return res.render("web/services/ghana-water-search", {
		pageTitle: "Doseal Limited | Ghana Water",
		path: "/",
		errors: false,
		errorMessage: false,
		phoneNumber: user.phoneNumber,
		csrfToken: req.csrfToken(),
	});
}
// post ghana water
async function postSearchGhanaWater(req, res) {
	Log.info(
		`[webController.js][postSearchGhanaWater] posting Ghana Water request: ${req.ip}`
	);
	let inputData;
	const { accountNumber, type = null, phoneNumber } = req.body;
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ECG_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	const tokenObject = req.cookies.jwt;
	const token = tokenObject.acccess_token;

	try {
		inputData = {
			accountNumber: accountNumber,
			phoneNumber: phoneNumber,
			type: type,
		};

		hubtelResponse = await restMiddlewareServices.postGhanWaterSearch(
			inputData,
			token
		);
		if (hubtelResponse) {
			console.log("hubtelResponse: " + JSON.stringify(hubtelResponse));
			if (hubtelResponse.ResponseCode === "0000") {
				return res.json({
					success: true,
					code: 200,
					message: "Successful",
					accountNumber: accountNumber,
					data: hubtelResponse.Data,
				});
			}
			return res.json({
				success: false,
				code: 400,
				data: [],
			});
		}
		return res.json({
			success: false,
			message: ServiceCode.FAILED,
		});
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// transaction
async function geTransaction(req, res) {
	const user = req.session.user;
	Log.info(
		`[webController.js][geTransaction][${user._id}] visiting transaction page with IP: ${req.ip}`
	);

	const page = req.query.page || 1;
	const perPage = 15;

	const totalTransactions = await Transaction.find({
		createdBy: new mongoose.Types.ObjectId(user._id),
		cr_created: { $ne: true },
	}).countDocuments();

	try {
		const transactions = await Transaction.find({
			createdBy: new mongoose.Types.ObjectId(user._id),
			cr_created: { $ne: true },
		})
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.lean();

		// console.log(JSON.stringify(transactions));
		return res.render("web/services/transactions", {
			pageTitle: "Doseal Limited | Transactions",
			path: "/",
			longDate: longDate,
			transactions: transactions.length > 0 ? transactions : [],
			totalPages: Math.ceil(totalTransactions / perPage),
			currentPage: page,
			totalTransactions: totalTransactions,
			startDate: false,
			endDate: false,
			csrfToken: req.csrfToken(),
		});
	} catch (error) {
		return res.render("web/services/transactions", {
			pageTitle: "Doseal Limited | Transactions",
			path: "/",
			longDate: longDate,
			transactions: [],
			totalPages: Math.ceil(totalTransactions / perPage),
			currentPage: page,
			totalTransactions: false,
			startDate: false,
			endDate: false,
			csrfToken: req.csrfToken(),
		});
	}
}

module.exports = {
	getIndex,
	getContactUs,
	getAboutUs,
	getOurServices,
	postContacUs,
	getPages,
	getDownloads,
	getPayBill,
	getServiceSearch,
	postServiceSearch,
	postTransactionInitiate,
	postTransactionExecute,
	getAirtime,
	postServiceDataSearch,
	getSearchUtilityService,
	postUtilityServiceSearch,
	getGhanaWater,
	postSearchGhanaWater,
	geTransaction,
};
