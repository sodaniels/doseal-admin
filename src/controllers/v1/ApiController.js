const Page = require("../../models/page.model");
const WalletTopup = require("../../models/wallet-topup.model");
const { Log } = require("../../helpers/Log");
const ServiceCode = require("../../constants/serviceCode");
const { rand10Id } = require("../../helpers/randId");
const io = require("../../../socket");

async function getPageCategory(req, res) {
	const cat = req.params.pageCategory;

	try {
		const page = await Page.findOne({ category: cat }).select(
			"title category content"
		);
		if (page) {
			return res.json({
				success: true,
				code: 200,
				data: page,
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
			"[ApiController.js][getPageCategory]..error retrieving team",
			error
		);
		return res.json({
			success: false,
			code: 500,
			message: "An error occurred while retrieving data",
		});
	}
}

async function postTopUpWallet(req, res) {
	let walletData;
	try {
		Log.info(
			`[ApiController.js][postTopUpWallet][${JSON.stringify(
				req.body
			)}]\t incoming request: ` + req.ip
		);

		const requestId = rand10Id().toString();

		const walletTopupData = new WalletTopup({
			createdBy: req.user._id,
			requestId: requestId,
			amount: req.body.amount,
			mno: req.body.mno,
			account_no: req.body.phoneNumber,
			status: "Pending",
			statusCode: 411,
		});
		const storeWalletTopUp = await walletTopupData.save();

		try {
			walletData = await WalletTopup.find({ createdBy: req.user._id }).sort({
				_id: -1,
			});
		} catch (error) {}

		if (storeWalletTopUp) {
			try {
				io.getIO().emit("walletTopupDataUpdate", walletData);
				Log.info(
					"[ApiController.js][postTopUpWallet]\t Emitted upload Image event: "
				);
			} catch (error) {
				Log.info(
					`[ApiController.js][postTopUpWallet]\t error emitting walletTopUp update: `,
					error
				);
			}
			return res.json({
				success: true,
				message: ServiceCode.SUCCESS,
			});
		} else {
			return res.json({
				success: false,
				message: ServiceCode.FAILED,
			});
		}
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// get topup wallets
async function getTopUpWallets(req, res) {
	try {
		Log.info(
			`[ApiController.js][postTopUpWallet][${req.user._id}]\t retrieving top-up wallets`
		);
		const wallets = await WalletTopup.find({ createdBy: req.user._id }).sort({
			_id: -1,
		});
		if (wallets.length > 0) {
			return res.json({
				success: true,
				code: 200,
				data: wallets,
			});
		} else {
			return res.json({
				success: true,
				code: 404,
				data: [],
			});
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postTopUpWallet]\t error retrieving topup wallet data: ` +
				error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}

module.exports = {
	getPageCategory,
	postTopUpWallet,
	getTopUpWallets,
};
