const Page = require("../../models/page.model");
const User = require("../../models/user");
const Wallet = require("../../models/wallet.model");
const Tranaction = require("../../models/transaction.model");
const WalletTopup = require("../../models/wallet-topup.model");
const { Log } = require("../../helpers/Log");
const ServiceCode = require("../../constants/serviceCode");
const { rand10Id } = require("../../helpers/randId");
const io = require("../../../socket");

const { handleValidationErrors } = require("../../helpers/validationHelper");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");

const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();

// get topup wallet
async function AccountValidation(req, res) {
	Log.info(
		`[HubtelController.js][AccountValidation]\t IP ${req.ip}`
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ACCOUNT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	Log.info(
		`[HubtelController.js][AccountValidation] \t requeest to validate account`
	);
	// return res.json(req.body);

	try {
		const response = await restServices.postAccountValidation(
			req.body.phoneNumber,
			req.body.mno
		);
		return res.json(response);
	} catch (error) {
		Log.info(
			`[HubtelController.js][AccountValidation] error validating account: ${error.message}`
		);
		Log.info(
			`[HubtelController.js][AccountValidation] error details: ${JSON.stringify(
				error
			)}`
		);
		if (error.response) {
			Log.info(
				`[HubtelController.js][AccountValidation] response status: ${error.response.status}`
			);
			Log.info(
				`[HubtelController.js][AccountValidation] response data: ${JSON.stringify(
					error.response.data
				)}`
			);
		} else if (error.request) {
			Log.info(
				`[HubtelController.js][AccountValidation] request: ${error.request}`
			);
		} else {
			Log.info(
				`[HubtelController.js][AccountValidation] unknown error: ${error.message}`
			);
		}
		return res.json({
			success: false,
			error: {
				message: error.message,
				// Add more properties if needed
				...(error.response && { response: error.response.data }),
			},
		});
	}
}

// hubtel mtn topup request
async function HubtelAirtimeTopupRequest(req, res) {
	Log.info(
		`[HubtelController.js][HubtelAirtimeTopupRequest]\t IP ${req.ip}`
	);
	let response;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ACCOUNT_AIRTIME_TOPUP_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	Log.info(
		`[HubtelController.js][AccountValidation] \t requeest to validate account`
	);

	try {
		switch (req.body.network) {
			case "mtn-gh":
				response = await restServices.postHubtelMtnTopup(req, res);
				break;
			case "vodafone-gh":
				response = await restServices.postHubtelTelecelTopup(req, res);
				break;
			case "tigo-gh":
				response = await restServices.postHubtelAirtelTigoTopup(req, res);
				break;
			default:
				break;
		}

		return res.json(response);
	} catch (error) {
		Log.info(
			`[HubtelController.js][AccountValidation] error validating account: ${error.message}`
		);
		Log.info(
			`[HubtelController.js][AccountValidation] error details: ${JSON.stringify(
				error
			)}`
		);
		if (error.response) {
			Log.info(
				`[HubtelController.js][AccountValidation] response status: ${error.response.status}`
			);
			Log.info(
				`[HubtelController.js][AccountValidation] response data: ${JSON.stringify(
					error.response.data
				)}`
			);
		} else if (error.request) {
			Log.info(
				`[HubtelController.js][AccountValidation] request: ${error.request}`
			);
		} else {
			Log.info(
				`[HubtelController.js][AccountValidation] unknown error: ${error.message}`
			);
		}
		return res.json({
			success: false,
			error: {
				message: error.message,
				...(error.response && { response: error.response.data }),
			},
		});
	}
}

async function HubtelPaymentCheckout(req, res) {
	Log.info(
		`[HubtelController.js][HubtelPaymentCheckout]\t IP ${req.ip}`
	);
	// const validationError = handleValidationErrors(req, res);
	// if (validationError) {
	// 	const errorRes = await apiErrors.create(
	// 		errorMessages.errors.API_MESSAGE_ACCOUNT_VALIDATION_FAILED,
	// 		"POST",
	// 		validationError,
	// 		undefined
	// 	);
	// 	return res.json(errorRes);
	// }
	Log.info(
		`[HubtelController.js][HubtelPaymentCheckout] \t requeest to validate account`
	);
	try {
		const response = await restServices.postHubtelPaymentService(
			req.body.amount,
			req.body.description,
			req.body.internalReference
		);
		return res.json(response);
	} catch (error) {
		Log.info(
			`[HubtelController.js][HubtelPaymentCheckout] error validating account: ${error.message}`
		);
		Log.info(
			`[HubtelController.js][HubtelPaymentCheckout] error details: ${JSON.stringify(
				error
			)}`
		);
		if (error.response) {
			Log.info(
				`[HubtelController.js][HubtelPaymentCheckout] response status: ${error.response.status}`
			);
			Log.info(
				`[HubtelController.js][HubtelPaymentCheckout] response data: ${JSON.stringify(
					error.response.data
				)}`
			);
		} else if (error.request) {
			Log.info(
				`[HubtelController.js][HubtelPaymentCheckout] request: ${error.request}`
			);
		} else {
			Log.info(
				`[HubtelController.js][HubtelPaymentCheckout] unknown error: ${error.message}`
			);
		}
		return res.json({
			success: false,
			error: {
				message: error.message,
				...(error.response && { response: error.response.data }),
			},
		});
	}
}

module.exports = {
	AccountValidation,
	// PrepaidPostpaidRequest,
	HubtelAirtimeTopupRequest,
	HubtelPaymentCheckout,
};
