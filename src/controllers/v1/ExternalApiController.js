const Page = require("../../models/page.model");
const User = require("../../models/user");
const NewsRoom = require("../../models/news-room.model");
const Wallet = require("../../models/wallet.model");
const Transaction = require("../../models/transaction.model");
const ReportIssue = require("../../models/report-issue.model");
const Help = require("../../models/help.model");
const Feedback = require("../../models/feedback.model");
const FaultReport = require("../../models/fault-report.model");
const BalanceTransfer = require("../../models/balance-transfer.model");
const Meter = require("../../models/meter.model");
const WalletTopup = require("../../models/wallet-topup.model");
const { Log } = require("../../helpers/Log");
const ServiceCode = require("../../constants/serviceCode");
const { rand10Id } = require("../../helpers/randId");
const {
	calculateCompositeFee,
	processDosealFee,
	hashTransaction,
	orderTransactionResults,
	verifyTransaction,
	processDosealCommission,
} = require("../../helpers/calculateFee");
const io = require("../../../socket");

const { handleValidationErrors } = require("../../helpers/validationHelper");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();
const callbackController = require("./CallbackController");
const { result } = require("lodash");

// post msisdn query
async function postMSISDNquery(req, res) {
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_CREDIT_PURCHASE_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ExternalApiController.js][postMSISDNquery]\t incoming msisdn request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelMSISDNSearchService(
			req.body.phoneNumber
		);
		if (hubtelResponse) {
			if (hubtelResponse.ResponseCode === "0000") {
				hubtelResponse["success"] = true;
				return res.json(hubtelResponse);
			}
			return res.json(hubtelResponse);
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

module.exports = {
	postMSISDNquery,
};
