const Page = require("../../models/page.model");
const User = require("../../models/user");
const WalletTopup = require("../../models/wallet-topup.model");
const { Log } = require("../../helpers/Log");
const ServiceCode = require("../../constants/serviceCode");
const { rand10Id } = require("../../helpers/randId");
const io = require("../../../socket");

const { handleValidationErrors } = require("../../helpers/validationHelper");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");

//get page
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
// get topup wallet
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
			Log.info("[ApiController.js][postTopUpWallet]\t Emitting topup update: ");
			try {
				io.getIO().emit("walletTopupDataUpdate", walletData);
				Log.info(
					"[ApiController.js][postTopUpWallet]\t Emitted topup update: "
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
// get profile information
async function getProfile(req, res) {
	try {
		Log.info(
			`[ApiController.js][getProfile][${req.user._id}]\t profile information`
		);
		const user = await User.findOne({ _id: req.user._id }).select(
			"firstName middleName lastName email"
		);
		if (user) {
			return res.json({
				success: true,
				code: 200,
				data: user,
			});
		} else {
			return res.json({
				success: true,
				code: 404,
			});
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][getProfile]\t error retrieving profile information: ` +
				error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}
// put update profile
async function putUpdateProfile(req, res) {
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_UPDATE_PROFILE_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		Log.info(
			`[ApiController.js][putUpdateProfile][${req.user._id}]\t updating profile information`
		);
		let user = await User.findOne({ _id: req.user._id });
		if (!user) {
			return res.json({
				success: false,
				code: 404,
				message: "User not found",
			});
		}

		user.firstName = req.body.firstName;
		user.middleName = req.body.middleName;
		user.lastName = req.body.lastName;
		user.email = req.body.email;
		await user.save();
		if (user.isModified) {
			return res.json({
				success: true,
				code: 200,
				message: "Profile updated successfully",
			});
		} else {
			return res.json({
				success: false,
				code: 400,
				message: "Profile could not be updated.",
			});
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][putUpdateProfile][${req.user._id}]\t error updating profile: ${error}`
		);
	}
}

module.exports = {
	getPageCategory,
	postTopUpWallet,
	getTopUpWallets,
	getProfile,
	putUpdateProfile,
};
