const Page = require("../../models/page.model");
const User = require("../../models/user");
const Electricity = require("../../models/electricity.model");
const NewsRoom = require("../../models/news-room.model");
const Notification = require("../../models/notification.model");
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

// get notifications
async function getNotifications(req, res) {
	Log.info(
		`[InternalApiController.js][getNotificaitons]\t getting notifications`
	);
	try {
		const notification = await Notification.find({})
			.select("_id title excerpt message createdAt")
			.sort({ _id: -1 });
		if (notification) {
			return res.json({
				success: true,
				code: 200,
				data: notification,
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
			"[InternalApiController.js][getNotificaitons]..error retrieving notifications",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while retrieving data",
		});
	}
}

async function postAddElectricity(req, res) {
	try {
		const { phoneNumber, meterId, meterName } = req.body;
		Log.info(
			`[InternalApiController.js][postAddElectricity][${
				req.user._id
			}]\t adding electricity data: ${JSON.stringify(req.body)}`
		);
		const checkIfExists = await Electricity.findOne({
			createdBy: req.user._id,
			phoneNumber: phoneNumber,
			meterId: meterId,
		});
		if (checkIfExists) {
			return res.json({
				success: false,
				code: 409,
				message: "Meter already exists",
				data: checkIfExists,
			});
		}
		const electricityObject = new Electricity({
			phoneNumber: phoneNumber,
			meterId: meterId,
			meterName: meterName,
			createdBy: req.user._id,
		});
		const storeMeter = await electricityObject.save();
		if (storeMeter) {
			const electricityData = await Electricity.find({
				createdBy: req.user._id,
			});
			return res.json({
				success: true,
				code: 200,
				message: "Electricity information added successfully",
				data: electricityData,
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "Electricity information could not be added",
			});
		}
	} catch (error) {
		Log.info(
			`[InternalApiController.js][postAddElectricity][${req.user._id}]\t error adding electricity data: ${error}`
		);
		return res.json({
			success: false,
			code: 400,
			message: "Error adding electricity information",
		});
	}
}

module.exports = {
	getNews,
	getNotifications,
	postAddElectricity,
};
