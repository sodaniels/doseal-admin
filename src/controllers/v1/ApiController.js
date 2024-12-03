const Page = require("../../models/page.model");
const User = require("../../models/user");
const Wallet = require("../../models/wallet.model");
const Telco = require("../../models/telco.model");
const Water = require("../../models/water.model");
const TvStream = require("../../models/tv-streams.model");
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

const { getRedis, setRedisWithExpiry } = require("../../helpers/redis");
const { decrypt, encrypt } = require("../../helpers/crypt");

const { handleValidationErrors } = require("../../helpers/validationHelper");
const apiErrors = require("../../helpers/errors/errors");
const errorMessages = require("../../helpers/error-messages");
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();
const callbackController = require("../v1/CallbackController");
const { result, has } = require("lodash");

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
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_WALLET_TOPUP_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	let walletData, hubtelPaymentResponse, transaction;
	try {
		Log.info(
			`[ApiController.js][postTopUpWallet][${JSON.stringify(
				req.body
			)}]\t incoming request: ` + req.ip
		);
		const transactionId = rand10Id().toString();
		let currentDate = new Date();
		let formattedDate = currentDate
			.toISOString()
			.replace(/[-:TZ.]/g, "")
			.slice(0, 14);
		let uniqueId = `DR_${formattedDate}${
			Math.floor(Math.random() * 900000) + 100000
		}`;

		const debitDataObject = new Transaction({
			createdBy: req.user._id,
			transactionId: transactionId,
			internalReference: uniqueId,
			paymentOption: req.body.paymentOption,
			category: "DR",
			type: "WalletTopup",
			amount: req.body.amount,
		});
		transaction = await debitDataObject.save();

		try {
			walletData = await WalletTopup.find({ createdBy: req.user._id }).sort({
				_id: -1,
			});
		} catch (error) {
			Log.info(
				`[ApiController.js][postTopUpWallet]\t error getting wallet top ups  ${error}`
			);
		}

		try {
			const description = "Transfer to account wallet";
			hubtelPaymentResponse = await restServices.postHubtelPaymentService(
				req.body.amount,
				description,
				uniqueId
			);
			if (hubtelPaymentResponse) {
				Log.info(
					`[ApiController.js][postTopUpWallet][${uniqueId}]\t hubtel payment response : ` +
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
				`[ApiController.js][postTopUpWallet]\t error processing payment on hubtel ${error}`
			);
		}

		if (transaction) {
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
		const wallets = await Transaction.find({
			createdBy: req.user._id,
			type: "WalletTopup",
		}).sort({
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
			"firstName middleName lastName email nameFromTelco"
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
// post transaction init
async function postTransactionInitiate(req, res) {
	let fee, totalAmount, verifiedName, checkIfAccountExists;

	const { phoneNumber, amount, type, accountName, accountNumber, network } =
		req.body;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_TRANSACTION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	Log.info(
		`[ApiController.js][postTransactionInitiate]\t incoming initiate transaction: ` +
			req.ip
	);

	try {
		const hubtelFee = await calculateCompositeFee(amount, type);

		const dosealFee = await processDosealFee(amount, type);

		fee = dosealFee + hubtelFee;

		req.body.fee = fee;

		totalAmount = Number(amount) + Number(fee);

		req.body.totalAmount = totalAmount;

		let currentDate = new Date();

		req.body["transaction_time"] = currentDate;

		req.body["accountName"] = accountName ? accountName : undefined;
		req.body["accountNumber"] = accountNumber ? accountNumber : undefined;

		try {
			checkIfAccountExists = await Telco.findOne({
				phoneNumber: phoneNumber,
				network: network,
				type: type,
				createdBy: req.user._id,
			});

			if (checkIfAccountExists) {
				verifiedName = checkIfAccountExists.verifiedName;
				Log.info(
					`[ApiController.js][postTransactionInitiate]\t retrieving verifiedName from database`
				);
			}
		} catch (error) {
			Log.info(
				`[ApiController.js][postTransactionInitiate]\t error getting verified name: ${error}`
			);
		}

		if (network && !checkIfAccountExists) {
			const hubtelResponse = await restServices.postHubtelMSISDNSearchService(
				phoneNumber
			);
			Log.info(
				`[ApiController.js][postTransactionInitiate]\t msisdn search result: ${JSON.stringify(
					hubtelResponse
				)}`
			);

			if (hubtelResponse && hubtelResponse.ResponseCode === "0000") {
				const data = hubtelResponse.Data[0];
				verifiedName = data.Value;
			}
		}

		console.log("verifiedName: " + verifiedName);

		req.body["verifiedName"] = verifiedName;

		console.log("Before encryption: " + JSON.stringify(req.body));

		const transactionHash = hashTransaction(req.body);

		const checksum = transactionHash.toUpperCase();

		const encryptedTransaction = encrypt(JSON.stringify(req.body));
		await setRedisWithExpiry(checksum, 600, encryptedTransaction);

		return res.json({
			success: true,
			code: 200,
			result: req.body,
			checksum: checksum,
		});
	} catch (error) {
		Log.info(
			`[ApiController.js][postTransactionInitiate]\t error initiating transaction: ` +
				error
		);
		return res.json({
			success: false,
			code: 500,
		});
	}
}
// post transacion execute
async function postTransactionExecute(req, res) {
	let transaction, hubtelPaymentResponse, description, referrer, user;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_TRANSACTION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ApiController.js][postTransactionExecute]\t incoming transaction execute request: ` +
				req.ip
		);
		const transactionId = rand10Id().toString();
		const checksum = req.body.checksum;

		const encryptedTransaction = await getRedis(checksum);

		if (!encryptedTransaction) {
			Log.info(
				`[ApiController.js][postTransactionExecute]\t... transaction validation failed`
			);
			const errorRes = await apiErrors.create(
				errorMessages.errors.API_MESSAGE_TRANSACTION_FAILED,
				"POST",
				"Transaction detail has changed after validation. Please call the 'transactions/initiate' endpoint again to revalidate transaction",
				undefined
			);
			return {
				success: false,
				code: 400,
				error: errorRes,
			};
		}

		const decryptedTransaction = decrypt(encryptedTransaction);
		const transactionDetails = JSON.parse(decryptedTransaction);

		Log.info(
			`[ApiController.js][postTransactionExecute]\t... transaction requestBody: ${JSON.stringify(
				transactionDetails
			)}`
		);

		req.body = transactionDetails;

		// give hubtel fee
		const hubtelFee = await calculateCompositeFee(
			req.body.amount,
			req.body.type
		);
		// give fee
		const dosealFee = await processDosealFee(req.body.amount, req.body.type);
		//give commission
		const commission = await processDosealCommission(
			req.body.amount,
			req.body.type,
			req.body.network ? req.body.network : undefined
		);

		fee = dosealFee + hubtelFee;

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
			case "GhanaWater":
				description = "Payment for Ghana Water";
				break;
			case "DATA":
				description = "Payment for Mobile data";
				break;
			case "TELECEL_POSTPAID":
				description = "Payment for Telecel Postpaid ";
				break;
			case "TELECEL_BROADBAND":
				description = "Payment for Telecel Broadband ";
				break;
			default:
				break;
		}

		try {
			user = await User.findOne({ _id: req.user._id }).select("_id referrer");
			Log.info(
				`[ApiController.js][postTransactionExecute][${uniqueId}]\t retrieving user referrer: ${user.referrer}`
			);
		} catch (error) {
			Log.info(
				`[ApiController.js][postTransactionExecute][${uniqueId}]\t error loading referrer: ${error}`
			);
		}

		const debitDataObject = new Transaction({
			createdBy: req.user._id,
			transactionId: transactionId,
			internalReference: uniqueId,
			referrer: user ? user.referrer : undefined,
			category: "DR",
			type: req.body.type,
			amount: req.body.amount,
			verifiedName: req.body.verifiedName ? req.body.verifiedName : undefined,
			fee: req.body.fee,
			commission: commission,
			totalAmount: req.body.totalAmount,
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
			bundleName: req.body.bundleName ? req.body.bundleName : undefined,
			bundleValue: req.body.bundleValue ? req.body.bundleValue : undefined,
			sessionId: req.body.sessionId ? req.body.sessionId : undefined,
		});
		transaction = await debitDataObject.save();
		if (transaction) {
			Log.info(
				`[ApiController.js][postTransactionExecute][${uniqueId}]\t initiating payment request to hubtel`
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
				io.getIO().emit("excerptTransactionUpdate", excerptTrans);
				Log.info(
					"[ApiController.js][postTransactionExecute]\t Emitted excerpt update: "
				);
			} catch (error) {
				Log.info(
					`[ApiController.js][postTransactionExecute]\t error emitting excerpt update: `,
					error
				);
			}

			try {
				hubtelPaymentResponse = await restServices.postHubtelPaymentService(
					req.body.totalAmount,
					description,
					uniqueId
				);

				if (hubtelPaymentResponse) {
					Log.info(
						`[ApiController.js][postTransactionExecute][${uniqueId}]\t hubtel payment response : ` +
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
					`[ApiController.js][postTransactionExecute][${uniqueId}]\t hubtel payment error : ${error}`
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
			`[ApiController.js][postTransactionExecute][${req.user._id}]\t retrieving transactions`
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
			Log.info(
				`[ApiController.js][postHubtelEcgMeterSearch]\t incoming ecg meter search request: ` +
					JSON.stringify(hubtelResponse)
			);
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
			Log.info(
				`[ApiController.js][postHubtelDstvAccountSearch]\t hubtelResponse: ` +
					JSON.stringify(hubtelResponse)
			);

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
// search tv streaming
async function postHubtelTvStreamingSearch(req, res) {
	let verifiedName, checkIfAccountExists, hubtelResponse_;
	const { accountNumber, type } = req.body;
	Log.info(
		`[ApiController.js][postHubtelTvStreamingSearch][${accountNumber}]\t incoming tv account search: IP: ` +
			req.ip
	);
	Log.info(
		`[ApiController.js][postHubtelTvStreamingSearch]\t requestBody: ` +
			JSON.stringify(req.body)
	);
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
		checkIfAccountExists = await TvStream.findOne({
			accountNumber: accountNumber,
			type: type,
			createdBy: req.user._id,
		});

		if (checkIfAccountExists) {
			verifiedName = checkIfAccountExists.verifiedName;
			Log.info(
				`[ApiController.js][postHubtelTvStreamingSearch]\t retrieving verifiedName from database`
			);
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postHubtelTvStreamingSearch]\t error getting verified name: ${error}`
		);
	}

	if (!checkIfAccountExists) {
		try {
			switch (type) {
				case "DSTV":
					hubtelResponse_ =
						await restServices.postHubtelDstvAccountSearchService(
							accountNumber
						);
					if (hubtelResponse_ && hubtelResponse_.ResponseCode === "0000") {
						const data = hubtelResponse_.Data[0];
						verifiedName = data.Value;
					}
					break;
				case "GOTV":
					hubtelResponse_ =
						await restServices.postHubtelGoTVAccountSearchService(
							accountNumber
						);
					if (hubtelResponse_ && hubtelResponse_.ResponseCode === "0000") {
						const data = hubtelResponse_.Data[0];
						verifiedName = data.Value;
					}
					break;
				case "STARTV":
					hubtelResponse_ =
						await restServices.postHubtelStartTimeTVAccountSearchService(
							accountNumber
						);
					if (hubtelResponse_ && hubtelResponse_.ResponseCode === "0000") {
						const data = hubtelResponse_.Data[0];
						verifiedName = data.Value;
					}
					break;
				default:
					break;
			}
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postHubtelTvStreamingSearch][${req.user._id}]\t error getting verifiedName: ${error}`
			);
		}

		try {
			const tvStreamObject = new TvStream({
				accountNumber: accountNumber,
				verifiedName: verifiedName ? verifiedName : undefined,
				type: type,
				createdBy: req.user._id,
			});
			await tvStreamObject.save();

			hubtelResponse_["verifiedName"] = verifiedName ? verifiedName : undefined;
			hubtelResponse["success"] = true;
			return res.json(hubtelResponse_);
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postHubtelTvStreamingSearch][${req.user._id}]\t error storing data info: ${error}`
			);
		}
	}

	try {
		switch (type) {
			case "DSTV":
				hubtelResponse = await restServices.postHubtelDstvAccountSearchService(
					accountNumber
				);
				break;
			case "GOTV":
				hubtelResponse = await restServices.postHubtelGoTVAccountSearchService(
					accountNumber
				);
				break;
			case "STARTIMESTV":
				hubtelResponse =
					await restServices.postHubtelStartTimeTVAccountSearchService(
						accountNumber
					);
				break;
			default:
				break;
		}

		if (hubtelResponse) {
			Log.info(
				`[ApiController.js][postHubtelTvStreamingSearch][${accountNumber}]\t hubtelResponse: ` +
					JSON.stringify(hubtelResponse)
			);

			if (hubtelResponse.ResponseCode === "0000") {
				hubtelResponse["success"] = true;
				hubtelResponse["verifiedName"] = verifiedName
					? verifiedName
					: undefined;
				return res.json(hubtelResponse);
			}
			if (hubtelResponse.ResponseCode === "4000") {
				hubtelResponse["success"] = false;
				hubtelResponse["verifiedName"] = verifiedName
					? verifiedName
					: undefined;
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
// search ghana water account
async function postHubtelGhanaWaterAccountSearch(req, res) {
	let checkIfAccountExists, hubtelResponse, verifiedName, hubtelResponse_;
	const { accountNumber, phoneNumber, type } = req.body;
	Log.info(
		`[ApiController.js][postHubtelGhanaWaterAccountSearch]\t incoming ghana water account search request: ` +
			req.ip
	);
	Log.info(
		`[ApiController.js][postHubtelGhanaWaterAccountSearch]\t requestBody: ${JSON.stringify(
			req.body
		)}`
	);
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_GHANA_WATER_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		checkIfAccountExists = await Water.findOne({
			accountNumber: accountNumber,
			phoneNumber: phoneNumber,
			createdBy: req.user._id,
		});

		if (checkIfAccountExists) {
			verifiedName = checkIfAccountExists.verifiedName;
			Log.info(
				`[ApiController.js][postHubtelGhanaWaterAccountSearch]\t retrieving verifiedName from database`
			);
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postHubtelGhanaWaterAccountSearch]\t error getting verified name: ${error}`
		);
	}

	if (!checkIfAccountExists) {
		try {
			hubtelResponse_ =
				await restServices.postHubtelGhanaWaterAccountSearchService(
					accountNumber,
					phoneNumber
				);
			if (hubtelResponse_ && hubtelResponse_.ResponseCode === "0000") {
				const data = hubtelResponse_.Data[0];
				verifiedName = data.Value;
			}
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postHubtelGhanaWaterAccountSearch][${req.user._id}]\t error getting verifiedName: ${error}`
			);
		}

		try {
			const itemObject = new Water({
				accountNumber: accountNumber,
				phoneNumber: phoneNumber,
				verifiedName: verifiedName ? verifiedName : undefined,
				type: type,
				createdBy: req.user._id,
			});
			await itemObject.save();

			hubtelResponse_["verifiedName"] = verifiedName ? verifiedName : undefined;
			hubtelResponse["success"] = true;
			return res.json(hubtelResponse_);
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postHubtelTvStreamingSearch][${req.user._id}]\t error storing data info: ${error}`
			);
		}
	}

	try {
		hubtelResponse =
			await restServices.postHubtelGhanaWaterAccountSearchService(
				accountNumber,
				phoneNumber
			);
		if (hubtelResponse) {
			if (hubtelResponse.ResponseCode === "0000") {
				hubtelResponse["success"] = true;
				hubtelResponse["verifiedName"] = verifiedName
					? verifiedName
					: undefined;
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
// get stored meters
async function getStoredECGMeters(req, res) {
	try {
		Log.info(
			`[ApiController.js][getStoredECGMeters]\t retrieving stored ECG meters ` +
				req.ip
		);

		const meters = await Meter.find({ createdBy: req.user._id });
		if (meters.length > 0) {
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				data: meters,
			});
		} else {
			return res.json({
				success: false,
				code: 200,
				status: ServiceCode.NO_DATA_FOUND,
				data: [],
			});
		}
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			code: 500,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// process account wallet payment
async function processAccountWalletPayment(req, uniqueId, res) {
	try {
		Log.info(
			`[ApiController.js][postTransactionExecute][processAccountWalletPayment][${uniqueId}]\t processing account wallet payment`
		);
		let user = await User.findOne({ _id: req.user._id });
		if (Number(user.balance) < Number(req.body.amount)) {
			console.log(user.balance);
			return {
				success: false,
				code: 401,
				message: ServiceCode.ACCOUNT_BALANCE_EXCEEDED,
			};
		}
		const balance = user.balance ? user.balance : 0;
		user.balance = Number(balance) - Number(req.body.amount);
		if (user.isModified) {
			await user.save();
		}

		Log.info(
			"[ApiController.js][processAccountWalletPayment]\t Emitting balance update: "
		);
		try {
			io.getIO().emit("balanceUpdate", user.balance);
			Log.info(
				"[ApiController.js][processAccountWalletPayment]\t Emitted balance update: "
			);
		} catch (error) {
			Log.info(
				`[ApiController.js][processAccountWalletPayment]\t error emitting balance update: `,
				error
			);
		}

		const CheckoutId = rand10Id().toString() + rand10Id().toString();
		const SalesInvoiceId = rand10Id().toString() + rand10Id().toString();

		const Data = {
			CheckoutId: CheckoutId,
			SalesInvoiceId: SalesInvoiceId,
			ClientReference: uniqueId,
			Status: "Success",
			Amount: req.body.amount,
			CustomerPhoneNumber: req.body.phoneNumber,
			PaymentDetails: {
				PaymentType: "InternalWallet",
				Channel: "Wallet",
			},
			Description: "Transaction sucessful",
		};

		delete req.body;

		req.body = {};
		req.body["ResponseCode"] = "0000";
		req.body["Status"] = "Success";
		req.body["Data"] = Data;
		Log.info(
			`[ApiController.js][postTransactionExecute][processAccountWalletPayment][${uniqueId}]\t account wallet payment response: ${JSON.stringify(
				req.body
			)}`
		);

		try {
			await callbackController.postHubtelPaymentCallback(req);
		} catch (error) {
			Log.info(
				`[ApiController.js][postTransactionExecute][processAccountWalletPayment][${uniqueId}]\t error processing account wallet callback: ${error}`
			);
		}

		const callbackResponse = {
			success: true,
			status: "Success",
			message: ServiceCode.ACCOUNT_WALLET_IN_PROGRESS,
		};
		return callbackResponse;
	} catch (error) {
		Log.info(
			`[ApiController.js][postTransactionExecute]processAccountWalletPayment\t error processing account wallet payment ${error}`
		);
	}
}
// post reported issue
async function postReportedIssue(req, res) {
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_ISSUE_REPORT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		Log.info(
			`[ApiController.js][postReportedIssue]\t storing reported issue for ${req.user._id} `
		);
		const issueObject = new ReportIssue({
			createdBy: req.user._id,
			title: req.body.title,
			category: req.body.category,
			message: req.body.message,
			reference: req.body.reference,
		});

		const storeIssue = await issueObject.save();
		if (storeIssue) {
			const issues = await ReportIssue.find({ createdBy: req.user._id }).sort({
				_id: -1,
			});
			try {
				io.getIO().emit("issuesDataUpdate", issues);
				Log.info(
					"[ApiController.js][postReportedIssue]\t Emitted issues update: "
				);
			} catch (error) {
				Log.info(
					`[ApiController.js][postReportedIssue]\t error emitting issues update: `,
					error
				);
			}
			Log.info(
				`[ApiController.js][postReportedIssue]\t stored reported issue for ${req.user._id} `
			);
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				message:
					"We have received your message successfully. We will get back to you where necessary.",
			});
		} else {
			Log.info(
				`[ApiController.js][postReportedIssue]\t couldnt store reported issue for ${req.user._id} `
			);
			return res.json({
				success: true,
				code: 400,
				status: ServiceCode.FAILED,
				message: "Your report could not be saved. Please try again.",
			});
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postReportedIssue]\t an error occurred while storing reported issue for ${req.user._id} `
		);
		return res.json({
			success: true,
			code: 500,
			status: ServiceCode.ERROR_OCCURED,
			message: "An error occcured while submitting the message.",
		});
	}
}
// get reported issues
async function getReportedIssues(req, res) {
	try {
		Log.info(
			`[ApiController.js][getReportedIssues]\t retrieving reported issues for ${req.user._id} ` +
				req.ip
		);
		const issues = await ReportIssue.find({ createdBy: req.user._id });
		if (issues.length > 0) {
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				data: issues,
			});
		} else {
			return res.json({
				success: false,
				code: 200,
				status: ServiceCode.NO_DATA_FOUND,
				data: [],
			});
		}
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			code: 500,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// post feedback
async function postFeedback(req, res) {
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_FEEDBACK_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		Log.info(
			`[ApiController.js][postFeedback]\t storing feedback for ${req.user._id} `
		);
		const feedbackObject = new Feedback({
			createdBy: req.user._id,
			rating: req.body.rating,
			message: req.body.message,
		});

		const storeFeedback = await feedbackObject.save();
		if (storeFeedback) {
			const feedbacks = await Feedback.find({ createdBy: req.user._id }).sort({
				_id: -1,
			});
			try {
				io.getIO().emit("postFeedbackUpdate", feedbacks);
				Log.info("[ApiController.js][postFeedback]\t Emitted feeback update: ");
			} catch (error) {
				Log.info(
					`[ApiController.js][postFeedback]\t error emitting feedback update: `,
					error
				);
			}
			Log.info(
				`[ApiController.js][postFeedback]\t stored reported issue for ${req.user._id} `
			);
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				message:
					"We have received your feedback successfully. Thank you for helping to improve our services.",
			});
		} else {
			Log.info(
				`[ApiController.js][postFeedback]\t error sending feedback for ${req.user._id} `
			);
			return res.json({
				success: false,
				code: 400,
				status: ServiceCode.FAILED,
				message: "Something wrong happened while sending your feedback.",
			});
		}
	} catch (error) {
		Log.info(`[ApiController.js][postFeedback]\t an error occurred  ${error} `);
		return res.json({
			success: false,
			code: 500,
			status: ServiceCode.ERROR_OCCURED,
			message: "An error occcured while submitting the message.",
		});
	}
}
// get feedbacks
async function getFeedback(req, res) {
	try {
		Log.info(
			`[ApiController.js][getFeedback]\t retrieving feedback for ${req.user._id} ` +
				req.ip
		);
		const feedbacks = await Feedback.find({ createdBy: req.user._id });
		if (feedbacks.length > 0) {
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				data: feedbacks,
			});
		} else {
			return res.json({
				success: false,
				code: 200,
				status: ServiceCode.NO_DATA_FOUND,
				data: [],
			});
		}
	} catch (error) {
		return res.json({
			success: false,
			error: error.message,
			code: 500,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// search mtn bundle
async function postSearchDataBundleByNetwork(req, res) {
	Log.info(
		`[ApiController.js][postSearchDataBundleByNetwork]\t requestBody: ${JSON.stringify(
			req.body
		)}`
	);
	let hubtelResponse, verifiedName, checkIfAccountExists, internetResponse;
	let { accountNumber, network, type, alias } = req.body;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_DATA_BUNDLE_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		checkIfAccountExists = await Telco.findOne({
			phoneNumber: accountNumber,
			network: network,
			type: type,
			createdBy: req.user._id,
		});

		if (checkIfAccountExists) {
			verifiedName = checkIfAccountExists.verifiedName;
			Log.info(
				`[ApiController.js][postSearchDataBundleByNetwork]\t retrieving verifiedName from database`
			);
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postSearchDataBundleByNetwork]\t error getting verified name: ${error}`
		);
	}

	if (!checkIfAccountExists) {
		try {
			if (
				network === "telecel-broadband" ||
				network === "telecel-postpaid-bill"
			) {
				switch (network) {
					case "telecel-broadband":
						internetResponse =
							await restServices.postHubtelTelecelBroadbandSearchService(
								accountNumber
							);
						if (internetResponse && internetResponse.ResponseCode === "0000") {
							const data = internetResponse.Data[0];
							verifiedName = data.Value;
						}

						console.log("verifiedName: " + verifiedName);
						break;
					case "telecel-postpaid-bill":
						internetResponse =
							await restServices.postHubtelTelecelPostpaidSearchService(
								accountNumber
							);
						if (internetResponse && internetResponse.ResponseCode === "0000") {
							const data = internetResponse.Data[0];
							verifiedName = data.Value;
						}
						break;
					default:
						break;
				}
			} else {
				const hubtelResponse = await restServices.postHubtelMSISDNSearchService(
					accountNumber
				);
				if (hubtelResponse && hubtelResponse.ResponseCode === "0000") {
					const data = hubtelResponse.Data[0];
					verifiedName = data.Value;
				}
			}
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postSearchDataBundleByNetwork][${req.user._id}]\t error getting verifiedName: ${error}`
			);
		}

		try {
			const telcoObject = new Telco({
				phoneNumber: accountNumber,
				network: network,
				verifiedName: verifiedName ? verifiedName : undefined,
				alias: alias ? alias : undefined,
				type: type,
				createdBy: req.user._id,
			});
			await telcoObject.save();
		} catch (error) {
			Log.info(
				`[InternalApiController.js][postSearchDataBundleByNetwork][${req.user._id}]\t error storing data info: ${error}`
			);
		}
	}

	try {
		Log.info(
			`[ApiController.js][postSearchDataBundleByNetwork][${accountNumber}][${network}]\t incoming data bundle search request: ` +
				req.ip
		);
		Log.info(
			`[ApiController.js][postSearchDataBundleByNetwork][${accountNumber}][${network}]\t requestBody: ` +
				JSON.stringify(req.body)
		);

		switch (network) {
			case "mtn-gh":
				hubtelResponse = await restServices.postMtnDataSearchService(
					accountNumber
				);
				break;
			case "vodafone-gh":
				hubtelResponse = await restServices.postTelecelDataSearchService(
					accountNumber
				);
				break;
			case "tigo-gh":
				hubtelResponse = await restServices.postAirtelTigoDataSearchService(
					accountNumber
				);
				break;

			case "telecel-broadband":
				hubtelResponse =
					await restServices.postHubtelTelecelBroadbandSearchService(
						accountNumber
					);
				break;
			case "telecel-postpaid-bill":
				hubtelResponse =
					await restServices.postHubtelTelecelPostpaidSearchService(
						accountNumber
					);
				break;
			default:
				return res.json({
					success: false,
					code: 400,
					message: ServiceCode.FAILED,
				});
				break;
		}

		if (hubtelResponse) {
			if (hubtelResponse.ResponseCode === "0000") {
				hubtelResponse["verifiedName"] = verifiedName
					? verifiedName
					: undefined;
				hubtelResponse["success"] = true;
				Log.info(
					`[ApiController.js][postSearchDataBundleByNetwork][${accountNumber}][${network}]\t hubtelResponse: ` +
						JSON.stringify(hubtelResponse)
				);
				return res.json(hubtelResponse);
			}

			Log.info(
				`[ApiController.js][postSearchDataBundleByNetwork][${accountNumber}][${network}]\t hubtelResponse: ` +
					JSON.stringify(hubtelResponse)
			);
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
// post transaction status check
async function getTransactionStatusCheck(req, res) {
	let hubtelResponse;
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_DATA_BUNDLE_FAILED,
			"GET",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}
	try {
		Log.info(
			`[ApiController.js][getTransactionStatusCheck]\t incoming transaction status check: ` +
				req.ip
		);

		hubtelResponse = await restServices.getTransactionStatusCheckService(
			req.query.clientReference
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
// get balance query
async function getPOSBalanceQuery(req, res) {
	let hubtelResponse;
	try {
		Log.info(
			`[ApiController.js][getBalanceQuery]\t incoming balance query request: ` +
				req.ip
		);

		hubtelResponse = await restServices.getPosBalanceQueryService();
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
// get prepaid balance query
async function getPrepaidBalanceQuery(req, res) {
	let hubtelResponse;
	try {
		Log.info(
			`[ApiController.js][getPrepaidBalanceQuery]\t incoming prepaid balance query request: ` +
				req.ip
		);

		hubtelResponse = await restServices.getPrepaidBalanceQueryService();
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
// post transfer balance
async function postTransferBalance() {
	let hubtelResponse, balanceResponse, storeTransfer, Amount;
	try {
		let currentDate = new Date();
		let formattedDate = currentDate
			.toISOString()
			.replace(/[-:TZ.]/g, "")
			.slice(0, 14);
		let uniqueId = `TR_${formattedDate}${
			Math.floor(Math.random() * 900000) + 100000
		}`;

		// get amount and other information from balance query api
		balanceResponse = await restServices.getPosBalanceQueryService();

		if (balanceResponse && balanceResponse.responseCode === "0000") {
			const totalAmount = balanceResponse.data.amount;
			Amount = parseInt(totalAmount);

			if (Amount > 0) {
				const transferObject = new BalanceTransfer({
					amount: Amount,
					externalReference: uniqueId,
				});

				try {
					storeTransfer = await transferObject.save();
				} catch (error) {
					Log.info(
						`[ApiController.js][postTransferBalance] \t error saving transfer object: ${error}`
					);
				}

				try {
					hubtelResponse = await restServices.postTransferBalance(
						Amount,
						uniqueId
					);
				} catch (error) {
					Log.info(
						`[ApiController.js][postTransferBalance] \t error retrieving balance: ${error}`
					);
				}

				if (
					storeTransfer &&
					hubtelResponse &&
					hubtelResponse.responseCode === "0001"
				) {
					try {
						let Data = hubtelResponse.data;
						let transfer = await getBalanceTransferByTransferId(uniqueId);

						transfer.Description = Data.description;
						transfer.Charges = Data.charges;
						transfer.TransAmount = Data.amount;
						transfer.recipientName = Data.recipientName;

						if (transfer.isModified) {
							await transfer.save();
						}

						hubtelResponse["success"] = true;
						Log.info(
							`[ApiController.js][postTransferBalance] \t hubtelResponse": ${JSON.stringify(
								hubtelResponse
							)}`
						);
					} catch (error) {
						Log.info(
							`[ApiController.js][postTransferBalance] \t error upating transfer callack: ${error}`
						);
					}
				} else {
					Log.info(
						`[ApiController.js][postTransferBalance] \t error upating transfer callack: ${JSON.stringify(
							{
								success: false,
								message: ServiceCode.FAILED,
							}
						)}`
					);
				}
			}
		}
	} catch (error) {
		Log.info(`[ApiController.js][postTransferBalance] \t error: ${error}`);
		Log.info(
			`[ApiController.js][postTransferBalance] \t error upating transfer callack: ${JSON.stringify(
				{
					success: false,
					error: error.message,
					message: ServiceCode.ERROR_OCCURED,
				}
			)}`
		);
	}
}
// get balance transfer by transaction id
async function getBalanceTransferByTransferId(transferId) {
	try {
		const transfer = await BalanceTransfer.findOne({
			externalReference: transferId,
		});
		return transfer;
	} catch (error) {
		Log.info(
			`[ApiController.js][getBalanceTransferByTransferId][${transferId}]\t error : ${error}`
		);
		return null;
	}
}
// get help desk
async function getHelpDesk(req, res) {
	try {
		Log.info(
			`[ApiController.js][getHelpDesk]\t retrieving help desk by ${req.user._id} ` +
				req.ip
		);

		const helps = await Help.find({}).select("title category content");
		if (helps.length > 0) {
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				data: helps,
			});
		} else {
			return res.json({
				success: false,
				code: 200,
				status: ServiceCode.NO_DATA_FOUND,
				data: [],
			});
		}
	} catch (error) {
		Log.info(`[ApiController.js][getHelpDesk]\t error:  ${error} `);
		return res.json({
			success: false,
			error: error.message,
			code: 500,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// post report fault
async function postReportFault(req, res) {
	const validationError = handleValidationErrors(req, res);
	if (validationError) {
		const errorRes = await apiErrors.create(
			errorMessages.errors.API_MESSAGE_REPORT_FAULT_VALIDATION_FAILED,
			"POST",
			validationError,
			undefined
		);
		return res.json(errorRes);
	}

	try {
		Log.info(
			`[ApiController.js][postReportFault]\t storing fault report for ${req.user._id} `
		);
		const faultReportObject = new FaultReport({
			createdBy: req.user._id,
			category: req.body.category,
			message: req.body.message,
		});

		const storeFaultReport = await faultReportObject.save();
		if (storeFaultReport) {
			const faultReport = await FaultReport.find({
				createdBy: req.user._id,
			}).sort({
				_id: -1,
			});
			try {
				io.getIO().emit("postFaultReportpdate", faultReport);
				Log.info(
					"[ApiController.js][postReportFault]\t Emitted fault report update: "
				);
			} catch (error) {
				Log.info(
					`[ApiController.js][postReportFault]\t error emitting fault report update: `,
					error
				);
			}
			Log.info(
				`[ApiController.js][postReportFault]\t stored reported issue for ${req.user._id} `
			);
			return res.json({
				success: true,
				code: 200,
				status: ServiceCode.SUCCESS,
				message:
					"We have received your report successfully. You will hear from us within 2 buisness days",
			});
		} else {
			Log.info(
				`[ApiController.js][postReportFault]\t error sending report for ${req.user._id} `
			);
			return res.json({
				success: false,
				code: 400,
				status: ServiceCode.FAILED,
				message: "Something wrong happened while sending your report.",
			});
		}
	} catch (error) {
		Log.info(
			`[ApiController.js][postReportFault]\t an error occurred  ${error} `
		);
		return res.json({
			success: false,
			code: 500,
			status: ServiceCode.ERROR_OCCURED,
			message: "An error occcured while submitting the message.",
		});
	}
}
// post search telecel postpaid account
async function postHubtelTelecelPostpaidSearch(req, res) {
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
			`[ApiController.js][postHubtelTelecelPostpaidSearch]\t incoming telcel postpiad account search request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelTelecelPostpaidSearchService(
			req.body.accountNumber
		);
		if (hubtelResponse) {
			Log.info(
				`[ApiController.js][postHubtelTelecelPostpaidSearch]\t hubtelResponse: ` +
					JSON.stringify(hubtelResponse)
			);

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
		Log.info(
			`[ApiController.js][postHubtelTelecelPostpaidSearch]\t error: ` +
				JSON.stringify(error)
		);
		return res.json({
			success: false,
			error: error.message,
			message: ServiceCode.ERROR_OCCURED,
		});
	}
}
// post search telecel broadband
async function postHubtelTelecelBroadbandSearch(req, res) {
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
			`[ApiController.js][postHubtelTelecelBroadbandSearch]\t incoming telecel broadband account search request: ` +
				req.ip
		);

		hubtelResponse = await restServices.postHubtelTelecelBroadbandSearchService(
			req.body.accountNumber
		);
		if (hubtelResponse) {
			Log.info(
				`[ApiController.js][postHubtelTelecelBroadbandSearch]\t hubtelResponse: ` +
					JSON.stringify(hubtelResponse)
			);

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
		Log.info(
			`[ApiController.js][postHubtelTelecelBroadbandSearch]\t error: ` +
				JSON.stringify(error)
		);
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
	postTransactionInitiate,
	postTransactionExecute,
	getExcerptTransactions,
	getTransactions,
	postHubtelEcgMeterSearch,
	postHubtelDstvAccountSearch,
	postHubtelGoTVAccountSearch,
	postHubtelStarTimesTvAccountSearch,
	postHubtelGhanaWaterAccountSearch,
	getStoredECGMeters,
	processAccountWalletPayment,
	postReportedIssue,
	getReportedIssues,
	postFeedback,
	getFeedback,
	postSearchDataBundleByNetwork,
	getTransactionStatusCheck,
	getPOSBalanceQuery,
	getPrepaidBalanceQuery,
	postTransferBalance,
	getHelpDesk,
	postReportFault,
	postHubtelTelecelPostpaidSearch,
	postHubtelTelecelBroadbandSearch,
	postHubtelTvStreamingSearch,
};
