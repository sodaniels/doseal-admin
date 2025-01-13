const Transaction = require("../../models/transaction.model");
const { shortDate } = require("../../helpers/shortDate");
const Helpers = require("../../helpers/helper");
const TRANSTATS = require("../../models/TransactionStats.model");
const helpers = new Helpers();


async function getTransactions(req, res) {
	let transactionStats;
	const page = req.query.page || 1;
	const perPage = 20;
	const admin = req.session.admin;

	const transactions = await Transaction.find()
		.populate("createdBy")
		.sort({ createdAt: -1 })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.lean();

	const totalTransactions = await Transaction.countDocuments();

	transactionStats = await TRANSTATS.TransactionStats.findOne({});

	res.render("backend/transactions/manage", {
		pageTitle: "Transactions",
		path: "/transactions",
		transactions: transactions,
		shortDate: shortDate,
		totalPages: Math.ceil(totalTransactions / perPage),
		currentPage: page,
		admin: admin,
		totalTransactions: totalTransactions,
		transactionStats: transactionStats ? transactionStats: false,
        startDate: false,
        endDate: false,
        convertTo2Decimal: helpers.convertTo2Decimal,
	});
}

module.exports = {
	getTransactions,
};
