const User = require("../../models/user");
const Admin = require("../../models/admin.model");
const Device = require("../../models/device");
const Schedule = require("../../models/schedule.model");
const TRANSTATS = require("../../models/TransactionStats.model");
const CompletedJob = require("../../models/completed-job.model");
const Transaction = require("../../models/transaction.model");
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();
const Helpers = require("../../helpers/helper");
const helpers = new Helpers();

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0); // Start of the current day

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999); // End of the current day

async function getIndex(req, res) {
	let prepadidBalance, posBalance;
	let totalUsers,
		systemUsers,
		totalSchedules,
		completePickups,
		transactions,
		transactionStats,
		totalCreditTransactions,
		totalDownloads;
	try {
		totalUsers = await User.countDocuments({ role: "Subscriber" });
		systemUsers = await Admin.countDocuments({});
		totalSchedules = await Schedule.countDocuments({});
		completePickups = await CompletedJob.countDocuments({});
		transactionStats = await TRANSTATS.TransactionStats.findOne({});
		transactions = await Transaction.find({})
			.populate("createdBy")
			.sort({ createdAt: -1 })
			.limit(10);
		prepadidBalance = await restServices.getPrepaidBalanceQueryService();
		posBalance = await restServices.getPosBalanceQueryService();
		console.log("posBalance: " + JSON.stringify(posBalance));
		totalDownloads = await Device.countDocuments({
			createdAt: { $gte: startOfDay, $lt: endOfDay },
		});

		totalCreditTransactions = await Transaction.countDocuments({
			$and: [
				{
					$or: [
						{ category: { $regex: /^CR$/i } },
						{
							category: { $regex: /^DR$/i },
							transaction_status: 200,
						},
					],
				},
				{
					createdAt: { $gte: startOfDay, $lt: endOfDay },
				},
			],
		});
	} catch (error) {
		console.error(error);
	}

	return res.render("backend/index", {
		pageTitle: "Dashboard",
		path: "/admin/index",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
		totalUsers: totalUsers ? totalUsers : 0,
		systemUsers: systemUsers ? systemUsers : 0,
		totalSchedules: totalSchedules ? totalSchedules : 0,
		completePickups: completePickups ? completePickups : 0,
		prepadidBalance: prepadidBalance ? prepadidBalance : 0,
		posBalance: posBalance ? posBalance : 0,
		admin: req.session.user,
		transactions: transactions ? transactions : [],
		transactionStats: transactionStats ? transactionStats : false,
		convertTo2Decimal: helpers.convertTo2Decimal,
		totalDownloads: totalDownloads,
		totalCreditTransactions: totalCreditTransactions,
	});
}

async function getIndex1(req, res) {
	let totalUsers,
		systemUsers,
		totalSchedules,
		completePickups,
		posBalance,
		totalDownloads,
		transactions;
	try {
		totalUsers = await User.countDocuments({ role: "Subscriber" });
		systemUsers = await Admin.countDocuments({});
		totalSchedules = await Schedule.countDocuments({});
		completePickups = await CompletedJob.countDocuments({});
		prepadidBalance = await restServices.getPrepaidBalanceQueryService();
		posBalance = await restServices.getPosBalanceQueryService();
		console.log("posBalance: " + JSON.stringify(posBalance));
		totalDownloads = await Device.countDocuments({
			createdAt: { $gte: startOfDay, $lt: endOfDay },
		});
	} catch (error) {
		console.error(error);
	}
	return res.render("backend/index", {
		pageTitle: "Dashboard",
		path: "/admin/index",
		errors: false,
		errorMessage: false,
		csrfToken: req.csrfToken(),
		totalUsers: totalUsers ? totalUsers : 0,
		systemUsers: systemUsers ? systemUsers : 0,
		totalSchedules: totalSchedules ? totalSchedules : 0,
		completePickups: completePickups ? completePickups : 0,
		prepadidBalance: prepadidBalance ? prepadidBalance : 0,
		posBalance: posBalance ? posBalance : 0,
		admin: req.session.user,
		transactions: transactions ? transactions : [],
		convertTo2Decimal: helpers.convertTo2Decimal,
		totalDownloads: totalDownloads,
	});
}

module.exports = {
	getIndex,
	getIndex1,
};
