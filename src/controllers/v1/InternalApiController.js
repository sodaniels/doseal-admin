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

//get page
async function getNews(req, res) {
	Log.info(`[InternalApiController.js][getNews]\t getting news`);
	try {
		const news = await NewsRoom.find({}).sort({ _id: -1 });
		if (news) {
			return res.json({
				success: true,
				code: 200,
				data: news,
			});
		} else {
			return res.json({
				success: false,
				code: 404,
				message: "No data found for category",
			});
		}
	} catch (error) {
		Log.error(
			"[InternalApiController.js][getNews]..error retrieving news",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while retrieving data",
		});
	}
}

module.exports = {
	getNews,
};
