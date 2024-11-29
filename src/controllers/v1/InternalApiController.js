const Page = require("../../models/page.model");
const User = require("../../models/user");
const Electricity = require("../../models/electricity.model");
const Telco = require("../../models/telco.model");
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
// post electricity infrmation
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
				success: true,
				code: 200,
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
// get electricity information
async function getElectricity(req, res) {
	Log.info(
		`[InternalApiController.js][getElectricity]\t getting electricity information`
	);
	try {
		const electricityData = await Electricity.find({
			createdBy: req.user._id,
		}).sort({
			_id: -1,
		});
		if (electricityData) {
			return res.json({
				success: true,
				code: 200,
				data: electricityData,
			});
		} else {
			return res.json({
				success: false,
				code: 404,
				message: "No data found",
			});
		}
	} catch (error) {
		Log.error(
			"[InternalApiController.js][getElectricity]..error retrieving electricity",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while retrieving data",
		});
	}
}
// post airtime validation
async function postAirtimeValidation(req, res) {
	let verifiedName;
	try {
		const { phoneNumber, network, type, alias } = req.body;
		Log.info(
			`[InternalApiController.js][postAirtimeValidation][${
				req.user._id
			}]\t validating airtime: ${JSON.stringify(req.body)}`
		);
		const checkIfExists = await Telco.findOne({
			phoneNumber: phoneNumber,
			network: network,
			type: type,
			createdBy: req.user._id,
		});
		if (checkIfExists) {
			return res.json({
				success: true,
				code: 200,
				message: "Phone number already exists",
				data: checkIfExists,
			});
		}

		try {
			const hubtelResponse = await restServices.postHubtelMSISDNSearchService(
				phoneNumber
			);
			if (hubtelResponse && hubtelResponse.ResponseCode === "0000") {
				const data = hubtelResponse.Data[0];
				verifiedName = data.Value;
			}
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postAirtimeValidation][${req.user._id}]\t error getting verifiedName: ${error}`
			);
		}

		const telcoObject = new Telco({
			phoneNumber: phoneNumber,
			network: network,
			verifiedName: verifiedName ? verifiedName : undefined,
			alias: alias ? alias : undefined,
			type: type,
			createdBy: req.user._id,
		});
		const storeMeter = await telcoObject.save();
		if (storeMeter) {
			const telcoData = await Telco.findOne({
				phoneNumber: phoneNumber,
				network: network,
				type: type,
				alias: alias,
				createdBy: req.user._id,
			});
			return res.json({
				success: true,
				code: 200,
				message: "Information added successfully",
				data: telcoData,
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "Information could not be added",
			});
		}
	} catch (error) {
		Log.info(
			`[InternalApiController.js][postAirtimeValidation][${req.user._id}]\t error adding telco data: ${error}`
		);
		return res.json({
			success: false,
			code: 400,
			message: "Error adding information",
		});
	}
}
// get airtime
async function getAirtime(req, res) {
	Log.info(
		`[InternalApiController.js][getAirtime]\t getting airtime information`
	);
	try {
		const airtimeData = await Telco.find({
			createdBy: req.user._id,
			type: "Airtime",
		}).sort({
			_id: -1,
		});
		if (airtimeData) {
			return res.json({
				success: true,
				code: 200,
				data: airtimeData,
			});
		} else {
			return res.json({
				success: false,
				code: 404,
				message: "No data found",
			});
		}
	} catch (error) {
		Log.error(
			"[InternalApiController.js][getAirtime]..error retrieving airtime",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while airtime data",
		});
	}
}
// get data
async function getData(req, res) {
	Log.info(`[InternalApiController.js][getData]\t getting getData information`);
	try {
		const itemData = await Telco.find({
			createdBy: req.user._id,
			type: "DATA",
		}).sort({
			_id: -1,
		});
		if (itemData) {
			return res.json({
				success: true,
				code: 200,
				data: itemData,
			});
		} else {
			return res.json({
				success: false,
				code: 404,
				message: "No data found",
			});
		}
	} catch (error) {
		Log.error(
			"[InternalApiController.js][getData]..error retrieving airtime",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while airtime data",
		});
	}
}

module.exports = {
	getNews,
	getNotifications,
	postAddElectricity,
	getElectricity,
	postAirtimeValidation,
	getAirtime,
	getData,
};
