const Page = require("../../models/page.model");
const User = require("../../models/user");
const Wallet = require("../../models/wallet.model");
const Transaction = require("../../models/transaction.model");
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
// post wallet
async function postWallet(req, res) {
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_WALLET_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	let walletData;
	try {
		Log.info(`[ApiController.js][postWallet]\t incoming request: ` + req.ip);

		const q = req.body.phoneNumber.substr(-9);

		let wallet = await Wallet.findOne({
			phoneNumber: { $regex: q, $options: "i" },
		});

		if (wallet) {
			return res.json({
				success: false,
				code: 419,
				status: ServiceCode.ALREADY_EXISTS,
				message: "Wallet has been added already.",
			});
		}

		const userWalletData = new Wallet({
			createdBy: req.user._id,
			phoneNumber: req.body.phoneNumber,
			mno: req.body.mno,
		});
		const storeWallet = await userWalletData.save();

		try {
			walletData = await Wallet.find({ createdBy: req.user._id }).sort({
				_id: -1,
			});
		} catch (error) {}

		if (storeWallet) {
			Log.info("[ApiController.js][postWallet]\t Emitting wallet update: ");
			try {
				io.getIO().emit("walletUpdate", walletData);
				Log.info("[ApiController.js][postWallet]\t Emitted wallet update: ");
			} catch (error) {
				Log.info(
					`[ApiController.js][postWallet]\t error emitting wallet update: `,
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
//get wallet
async function getWallets(req, res) {
	try {
		Log.info(
			`[ApiController.js][getWallets][${req.user._id}]\t retrieving wallets`
		);
		const wallets = await Wallet.find({ createdBy: req.user._id }).sort({
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
			`[ApiController.js][getWallets]\t error retrieving wallet data: ` + error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}
// post buy credit
async function postBuyCredit(req, res) {
	let transaction, hubtelPaymentResponse, description;
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
		Log.info(`[ApiController.js][postBuyCredit]\t incoming request: ` + req.ip);
		const transactionId = rand10Id().toString();

		let currentDate = new Date();
		let formattedDate = currentDate
			.toISOString()
			.replace(/[-:TZ.]/g, "")
			.slice(0, 14);
		let uniqueId = `DR_${formattedDate}${
			Math.floor(Math.random() * 900000) + 100000
		}`;

		switch (req.body.type) {
			case "Airtime":
				description = "Purchase of Airtime";
				break;
			case "ECG":
				description = "Purchase of ECG";
				break;
			case "DSTV":
				description = "Payment for DSTV";
				break;
			case "GOtv":
				description = "Payment for GOtv";
				break;
			case "StarTimesTv":
				description = "Payment for Star Times Tv";
				break;
				;
			default:
				break;
		}

		const debitDataObject = new Transaction({
			createdBy: req.user._id,
			transactionId: transactionId,
			internalReference: uniqueId,
			category: "DR",
			type: req.body.type,
			amount: req.body.amount,
			cardNumber: req.body.cardNumber
				? `${req.body.cardNumber
						.trim()
						.substr(0, 2)}** **** **** ${req.body.cardNumber
						.trim()
						.substr(12, 2)}`
				: undefined,
			meterId: req.body.meterId ? req.body.meterId : undefined,
			meterName: req.body.meterName ? req.body.meterName : undefined,
			mno: req.body.mno ? req.body.mno : undefined,
			network: req.body.network ? req.body.network : undefined,
			paymentOption: req.body.paymentOption
				? req.body.paymentOption
				: undefined,
			phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : undefined,
			accountName: req.body.accountName ? req.body.accountName : undefined,
			accountNumber: req.body.accountNumber
				? req.body.accountNumber
				: undefined,
		});
		transaction = await debitDataObject.save();

		if (transaction) {
			Log.info(
				`[ApiController.js][postBuyCredit][${uniqueId}]\t initiating payment request to hubtel`
			);
			try {
				const excerptTrans = await Transaction.find({
					createdBy: req.user._id,
					cr_created: { $ne: true },
				})
					.sort({
						_id: -1,
					})
					.limit(4);
				// console.log("excerptTrans: ", excerptTrans)
				io.getIO().emit("excerptTransactionUpdate", excerptTrans);
				Log.info(
					"[CallbackController.js][postBuyCredit]\t Emitted excerpt update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postBuyCredit]\t error emitting excerpt update: `,
					error
				);
			}

			try {
				hubtelPaymentResponse = await restServices.postHubtelPaymentService(
					req.body.amount,
					description,
					uniqueId
				);

				if (hubtelPaymentResponse) {
					Log.info(
						`[ApiController.js][postBuyCredit][${uniqueId}]\t hubtel payment response : ` +
							JSON.stringify(hubtelPaymentResponse)
					);
					return res.json(hubtelPaymentResponse);
				}

				return res.json({
					success: false,
					code: 400,
					message: "Payment error occurred",
				});
			} catch (error) {
				Log.info(
					`[ApiController.js][postBuyCredit][${uniqueId}]\t hubtel payment error : ${error}`
				);
				return res.json({
					success: false,
					code: 500,
					error: error.message,
					message: "Payment error occurred",
				});
			}
		}
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// get transaction data
async function getExcerptTransactions(req, res) {
	try {
		//excerptTransData
		Log.info(
			`[ApiController.js][getExcerptTransactions][${req.user._id}]\t retrieving transactions`
		);
		const transactions = await Transaction.find({
			createdBy: req.user._id,
			cr_created: { $ne: true },
		})
			.sort({
				_id: -1,
			})
			.limit(4);
		if (transactions.length > 0) {
			return res.json({
				success: true,
				code: 200,
				data: transactions,
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
			`[ApiController.js][getExcerptTransactions]\t error retrieving transactions data: ` +
				error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}
// get transactions
async function getTransactions(req, res) {
	try {
		//excerptTransData
		Log.info(
			`[ApiController.js][getTransactions][${req.user._id}]\t retrieving transactions`
		);
		const transactions = await Transaction.find({
			createdBy: req.user._id,
			cr_created: { $ne: true },
		}).sort({
			_id: -1,
		});
		if (transactions.length > 0) {
			return res.json({
				success: true,
				code: 200,
				data: transactions,
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
			`[ApiController.js][getTransactions]\t error retrieving transactions data: ` +
				error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}
// search for ecg meter
async function postHubtelEcgMeterSearch(req, res) {
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
			`[ApiController.js][postHubtelEcgMeterSearch]\t incoming ecg meter search request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelEcgMeterSearchService(
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
// search hubtel dstv accounts
async function postHubtelDstvAccountSearch(req, res) {
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_DSTV_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ApiController.js][postHubtelDstvAccountSearch]\t incoming dstv account search request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelDstvAccountSearchService(
			req.body.accountNumber
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
// search goTv account
async function postHubtelGoTVAccountSearch(req, res) {
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_GOTV_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ApiController.js][postHubtelGoTVAccountSearch]\t incoming goTv account search request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelGoTVAccountSearchService(
			req.body.accountNumber
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
// search star times tv account
async function postHubtelStarTimesTvAccountSearch(req, res) {
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_STAR_TIMES_TV_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ApiController.js][postHubtelStarTimesTvAccountSearch]\t incoming star times tv account search request: ` +
				req.ip
		);

		hubtelResponse =
			await restServices.postHubtelStartTimeTVAccountSearchService(
				req.body.accountNumber
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
	getPageCategory,
	postTopUpWallet,
	getTopUpWallets,
	getProfile,
	putUpdateProfile,
	postWallet,
	getWallets,
	postBuyCredit,
	getExcerptTransactions,
	getTransactions,
	postHubtelEcgMeterSearch,
	postHubtelDstvAccountSearch,
	postHubtelGoTVAccountSearch,
	postHubtelStarTimesTvAccountSearch,
};
