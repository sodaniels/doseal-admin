const axios = require("axios");

const User = require("../../models/user");
const io = require("../../../socket");
const { Log } = require("../../helpers/Log");
const WalletTopup = require("../../models/wallet-topup.model");
const BalanceTransfer = require("../../models/balance-transfer.model");
const Transaction = require("../../models/transaction.model");
const Redeemed = require("../../models/redeemed");
const { sendText } = require("../../helpers/sendText");
const { rand10Id } = require("../../helpers/randId");
const RestServices = require("../../services/api/RestServices");
const TRANSTATS = require("../../models/TransactionStats.model");

const restServices = new RestServices();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// post hubtel airtime topup transaction
async function postHubtelAirtimeTopup(req, res) {
	let saveTransaction, transactionId, user;
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\tIP: " + req.ip
	);
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\tCallback Transaction: " +
			JSON.stringify(req.body)
	);

	let Data = req.body.Data;
	let Meta = Data.Meta;

	transactionId = Data.ClientReference;

	let transaction = await getTransactionByTransactionId(transactionId);

	if (transaction && transaction.statusCode === 411) {
		transaction.statusCode = req.body.code;
		transaction.status = req.body.status;
		transaction.statusMessage = req.body.message;
		transaction.externalReference = req.body.externalReference;

		transaction.ResponseCode = req.body.ResponseCode;
		transaction.Description = Data.Description;
		transaction.HubtelTransactionId = Data.TransactionId;
		transaction.ExternalTransactionId = Data.ExternalTransactionId;
		transaction.Commission = Meta.Commission;
		transaction.AmountDebited = Data.AmountDebited;
		transaction.Charges = Data.Charges;
		switch (transaction.ResponseCode) {
			case "0000":
				transaction.status = "Successful";
				transaction.statusCode = 200;
				transaction.statusMessage = "Transaction was successful";
				break;
			case "4080":
				transaction.status = "Failed";
				transaction.statusCode = 400;
				transaction.statusMessage = "Insufficient prepaid balance.";
				break;
			case "2001":
				if (Data.Description === "Invalid MSISDN : Invalid MSISDN") {
					transaction.status = "Failed";
					transaction.statusCode = 400;
					transaction.statusMessage = "Invalid Phone Number";
				}
				if (Data.Description === "65000 : Subscriber does not exit") {
					transaction.status = "Failed";
					transaction.statusCode = 400;
					transaction.statusMessage = "Invalid Phone Number";
				}

				break;

			default:
				transaction.status = "Failed";
				transaction.statusCode = 400;
				transaction.statusMessage = "Transaction Failed";
				break;
		}

		if (
			transaction.ResponseCode === "0000" &&
			transaction.referrer &&
			Number(transaction.amount >= 20) // credit referrer when amount sent is greater or equal to 20 ghs
		) {
			try {
				/** processing referrer*/
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t processing referrer`
				);
				try {
					await referralCodeProcessor(
						transaction.createdBy,
						transaction.referrer
					);
				} catch (error) {
					Log.info(
						`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t error processing referrer ${error}`
					);
				}
			} catch (error) {}
		}

		const transactionJSON = JSON.parse(JSON.stringify(transaction));

		user = await User.findById(transaction.createdBy);

		if (transactionJSON.useEarnings) {
			try {
				let redeemedAmount = transaction.totalAmount;

				let numberOfEarningRedeemed = redeemedAmount / 0.4;

				// Get the whole number part
				let wholeNumberOfEarning = Math.floor(numberOfEarningRedeemed);

				console.log("Whole Number:", wholeNumberOfEarning);

				// remove wholeNumberOfEarning above number of entries from referrals
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup] \t removing entries from referrals since redeemed`
				);
				const referralsToMove = user.referrals.slice(0, wholeNumberOfEarning);

				// Find or create a Redeemed document
				await Redeemed.findOneAndUpdate(
					{ redeemedBy: user._id },
					{
						$push: { referrals: { $each: referralsToMove } },
						$setOnInsert: { redeemedBy: user._id },
					},
					{ upsert: true }
				);

				// Remove the first wholeNumberOfEarning entries from the referrals array of the user
				user.referrals = user.referrals.slice(wholeNumberOfEarning);

				user.transactions -= redeemedAmount; // deduct wholeNumberOfEarning from the transactions field;

				// Save the updated user object
				await user.save();
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup] \t error: ${error}`
				);
			}

			try {
				const updatedUser = await User.findById(transaction.createdBy);

				const referralData = {
					referrals: updatedUser.referrals.length,
					transactions: updatedUser.transactions,
					referralCode: updatedUser.referralCode,
				};

				io.getIO().emit("referralDataUpate", referralData);
				Log.info(
					"[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t Emitted referralDataUpate update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t error emitting referralDataUpate: `,
					error
				);
			}
		}

		try {
			if (transaction.isModified) {
				saveTransaction = await transaction.save();
				// update debit request for transaction
				updateDrTransactionStatus(transaction, Data.Description);
			}
			Log.info(
				"[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t Emitting single topup update: "
			);
			Log.info(
				"[postHubtelAirtimeTopup.js][postBuyCredit]\t Emitting wallet update: "
			);

			try {
				io.getIO().emit("singleTransactionUpdate", saveTransaction);
				Log.info(
					"[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup]\t error emitting walletTopUp update: `,
					error
				);
			}
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t error saving callback data: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}
// post hubtel ecg topup
async function postHubtelUtilityCallbackServices(req, res) {
	let saveTransaction, transactionId;
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\tIP: " +
			req.ip
	);
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\tCallback Transaction: " +
			JSON.stringify(req.body)
	);

	let Data = req.body.Data;
	let Meta = Data.Meta;

	transactionId = Data.ClientReference;

	let transaction = await getTransactionByTransactionId(transactionId);

	if (transaction && transaction.statusCode === 411) {
		transaction.statusCode = req.body.code;
		transaction.status = req.body.status;
		transaction.statusMessage = req.body.message;
		transaction.externalReference = req.body.externalReference;

		transaction.ResponseCode = req.body.ResponseCode;
		transaction.Description = Data.Description;
		transaction.HubtelTransactionId = Data.TransactionId
			? Data.TransactionId
			: undefined;
		transaction.ExternalTransactionId = Data.ExternalTransactionId
			? Data.ExternalTransactionId
			: undefined;
		transaction.Commission = Meta ? Meta.Commission : undefined;
		transaction.AmountDebited = Data.AmountDebited
			? Data.AmountDebited
			: undefined;
		transaction.Charges = Data.Charges ? Data.Charges : undefined;
		switch (transaction.ResponseCode) {
			case "0000":
				transaction.status = "Successful";
				transaction.statusCode = 200;
				transaction.statusMessage = "Transaction was successful";

				break;
			case "4080":
				transaction.status = "Failed";
				transaction.statusCode = 400;
				transaction.statusMessage = "Insufficient prepaid balance.";
				break;
			case "2001":
				if (Data.Description === "Invalid MSISDN : Invalid MSISDN") {
					transaction.status = "Failed";
					transaction.statusCode = 400;
					transaction.statusMessage = "Invalid Phone Number";
				}
				if (Data.Description === "65000 : Subscriber does not exit") {
					transaction.status = "Failed";
					transaction.statusCode = 400;
					transaction.statusMessage = "Invalid Phone Number";
				}

				break;

			default:
				transaction.status = "Failed";
				transaction.statusCode = 400;
				transaction.statusMessage = "Transaction Failed";
				break;
		}

		try {
			if (transaction.isModified) {
				saveTransaction = await transaction.save();
				// update debit request for transaction
				updateDrTransactionStatus(transaction, Data.Description);
			}
			Log.info(
				"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t Emitting single topup update: "
			);
			Log.info(
				"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t Emitting wallet update: "
			);
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t error emitting walletTopUp update: `,
					error
				);
			}

			const currency = "GHS";
			const amount = parseFloat(transaction.amount).toFixed(2);
			const phoneNumber = transaction.createdBy.phoneNumber;
			const name =
				transaction.createdBy.firstName + " " + transaction.createdBy.lastName;
			const from = transaction.account_no;
			const support = process.env.DESEAL_CUSTOMER_CARE;

			if (saveTransaction) {
				if (req.body.ResponseCode.toString() === "0000") {
					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}

			try {
				io.getIO().emit("excerptTransData", transaction);
				Log.info(
					"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t Emitted wallet update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t error emitting wallet update: `,
					error
				);
			}
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices][${transactionId}]\t error saving callback data: ${error}`
			);
		}

		if (
			transaction.ResponseCode === "0000" &&
			transaction.referrer &&
			Number(transaction.amount >= 20) // credit referrer when amount sent is greater or equal to 20 ghs
		) {
			try {
				/** processing referrer*/
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t processing referrer`
				);
				try {
					await referralCodeProcessor(
						transaction.createdBy,
						transaction.referrer
					);
				} catch (error) {
					Log.info(
						`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t error processing referrer ${error}`
					);
				}
			} catch (error) {}
		}

		try {
			Log.info(
				"[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t updating transaction totals: "
			);
			await TRANSTATS.updateTransactionStats(saveTransaction);
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelUtilityCallbackServices]\t error updating transaction totals: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}
// post walelt topup callback
async function postWalletTopupCallback(req, res) {
	let staveRequest, requestId;
	Log.info("[postHubtelAirtimeTopup.js][walletTopupCallback]\tIP: " + req.ip);
	Log.info(
		"[postHubtelAirtimeTopup.js][walletTopupCallback]\tCallback Request: " +
			JSON.stringify(req.body)
	);

	requestId = req.body.requestId;

	let request = await getRequestByRequestId(requestId);

	if (request && request.statusCode === 411) {
		request.statusCode = req.body.code;
		request.status = req.body.status;
		request.statusMessage = req.body.message;
		request.externalReference = req.body.externalReference;
		try {
			staveRequest = await request.save();
			Log.info(
				"[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t Emitting single topup update: "
			);
			try {
				io.getIO().emit("singleItemTopUpDataUpdate", request);
				Log.info(
					"[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t error emitting walletTopUp update: `,
					error
				);
			}

			const currency = "GHS";
			const amount = parseFloat(request.amount).toFixed(2);
			const phoneNumber = request.createdBy.phoneNumber;
			const name =
				request.createdBy.firstName + " " + request.createdBy.lastName;
			const from = request.account_no;
			const support = process.env.DESEAL_CUSTOMER_CARE;

			if (staveRequest) {
				if (req.body.code.toString() === "200") {
					// update balance
					try {
						let user = await User.findOne({
							_id: request.createdBy._id,
						});
						const balance = user.balance ? user.balance : 0;
						user.balance = Number(balance) + Number(request.amount);
						await user.save();

						Log.info(
							"[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t Emitting balance update: "
						);
						try {
							io.getIO().emit("balanceUpdate", user.balance);
							Log.info(
								"[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t Emitted balance update: "
							);
						} catch (error) {
							Log.info(
								`[postHubtelAirtimeTopup.js][postWalletTopupCallback]\t error emitting balance update: `,
								error
							);
						}
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your transfer of ${currency} ${amount} from (${from}) to your wallet has been processed successfully. Request ID: ${requestId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `We could not transfer ${currency} ${amount} from (${from}) to your wallet. The transfer failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t error sending success message: ${error}`
						);
					}
				}
			}
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][getRequestByReference][${requestId}]\t error saving callback data: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}
// post payment callback
async function postHubtelPaymentCallback(req, res) {
	let transactionId;
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelPaymentCallback]\tIP: " + req.ip
	);
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelPaymentCallback]\tCallback Transaction: " +
			JSON.stringify(req.body)
	);

	try {
		let Data = req.body.Data;

		transactionId = Data.ClientReference;

		let transaction = await getTransactionByTransactionId(transactionId);

		if (transaction && transaction.statusCode === 411) {
			transaction.PaymentResponseCode = req.body.ResponseCode;
			transaction.PaymentStatus = req.body.Status;
			transaction.CheckoutId = Data.CheckoutId;
			transaction.SalesInvoiceId = Data.SalesInvoiceId;
			transaction.CustomerPhoneNumber = Data.CustomerPhoneNumber;
			transaction.PaymentAmount = Data.Amount;
			transaction.PaymentDetails = Data.PaymentDetails;
			transaction.PaymentDescription = Data.Description;

			if (req.body.ResponseCode === "0000") {
				transaction.status = "Successful";
				transaction.statusCode = 200;
				transaction.statusMessage = "Transaction was successful";
				transaction.cr_created = true;
			} else {
				transaction.status = "Failed";
				transaction.statusCode = 400;
				transaction.statusMessage = "Payment Failed";
			}
			try {
				if (transaction.isModified) {
					Log.info(
						`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][${transactionId}]\t payment callback saved`
					);
					await transaction.save();
					if (req.body.ResponseCode === "0000") {
						commitCreditTransaction(transaction);
					}
				}
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][${transactionId}]\t error saving callback data: ${error}`
				);
			}
		}

		res.status(200).json({
			code: 200,
			message: "Callback processed successfully.",
		});
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][${transactionId}]\t error processing payment callback: ${error}`
		);
	}
}
// hubtel transfer balance callback
async function postHubtelTransferBalanceCallback(req, res) {
	let transferId;
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelTransferBalanceCallback]\tIP: " +
			req.ip
	);
	Log.info(
		"[postHubtelAirtimeTopup.js][postHubtelTransferBalanceCallback]\tCallback Transaction: " +
			JSON.stringify(req.body)
	);

	try {
		let Data = req.body.Data;

		transferId = Data.ClientReference;

		let transfer = await getBalanceTransferByTransferId(transferId);

		if (transfer && transfer.statusCode === 411) {
			transfer.ResponseCode = req.body.ResponseCode;
			transfer.Description = Data.Description;
			transfer.TransAmount = Data.Amount;
			transfer.Charges = Data.Charges;
			transfer.RecipientName = Data.RecipientName;

			if (req.body.ResponseCode === "0000") {
				transfer.status = "Successful";
				transfer.statusCode = 200;
				transfer.statusMessage = "Transaction was successful";
			} else {
				transfer.status = "Failed";
				transfer.statusCode = 400;
				transfer.statusMessage = "Payment Failed";
			}
			if (transfer.isModified) {
				await transfer.save();
			}
		}

		res.status(200).json({
			code: 200,
			message: "Transfer Callback processed successfully.",
		});
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][postHubtelTransferBalanceCallback][${transferId}]\t error processing payment callback: ${error}`
		);
	}
}
// post transaction callback
async function postTransactionCallback(req, res) {
	let saveTransaction, transactionId;
	Log.info(
		"[postHubtelAirtimeTopup.js][postTransactionCallback]\tIP: " + req.ip
	);
	Log.info(
		"[postHubtelAirtimeTopup.js][postTransactionCallback]\tCallback Transaction: " +
			JSON.stringify(req.body)
	);

	transactionId = req.body.transactionId;

	let transaction = await getTransactionByTransactionId(transactionId);

	if (transaction && transaction.statusCode === 411) {
		transaction.statusCode = req.body.code;
		transaction.status = req.body.status;
		transaction.statusMessage = req.body.message;
		transaction.externalReference = req.body.externalReference;
		try {
			saveTransaction = await transaction.save();
			Log.info(
				"[postHubtelAirtimeTopup.js][postTransactionCallback]\t Emitting single topup update: "
			);
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[postHubtelAirtimeTopup.js][postTransactionCallback]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[postHubtelAirtimeTopup.js][postTransactionCallback]\t error emitting walletTopUp update: `,
					error
				);
			}

			const currency = "GHS";
			const amount = parseFloat(transaction.amount).toFixed(2);
			const phoneNumber = transaction.createdBy.phoneNumber;
			const name =
				transaction.createdBy.firstName + " " + transaction.createdBy.lastName;
			const from = transaction.account_no;
			const support = process.env.DESEAL_CUSTOMER_CARE;

			if (saveTransaction) {
				if (req.body.code.toString() === "200") {
					// update balance
					try {
						if (transaction.paymentOption === "Wallet") {
							let user = await User.findOne({
								_id: transaction.createdBy._id,
							});
							const balance = user.balance ? user.balance : 0;
							user.balance = Number(balance) - Number(transaction.amount);
							await user.save();

							Log.info(
								"[postHubtelAirtimeTopup.js][postTransactionCallback]\t Emitting balance update: "
							);
							try {
								io.getIO().emit("balanceUpdate", user.balance);
								Log.info(
									"[postHubtelAirtimeTopup.js][postTransactionCallback]\t Emitted balance update: "
								);
							} catch (error) {
								Log.info(
									`[postHubtelAirtimeTopup.js][postTransactionCallback]\t error emitting balance update: `,
									error
								);
							}
						}
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][getRequestByReference][${transactionId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][postTransactionCallback][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][postTransactionCallback][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[postHubtelAirtimeTopup.js][postTransactionCallback][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[postHubtelAirtimeTopup.js][postTransactionCallback][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postTransactionCallback][${transactionId}]\t error saving callback data: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}
// commit credit transaction
async function commitCreditTransaction(transaction) {
	let hubtelResponse, creditTransaction;
	const transactionId = transaction.internalReference;
	try {
		const creditTransactionId = rand10Id().toString();

		Log.info(
			`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${transactionId}]\t committing credit transaction`
		);
		const uniqueId =
			transaction.internalReference.split("_")[1] ||
			transaction.internalReference;

		const creditDataObject = new Transaction({
			createdBy: transaction.createdBy,
			transactionId: creditTransactionId,
			internalReference: `CR_${uniqueId}`,
			commonReference: transaction.internalReference,
			category: "CR",
			type: transaction.type,
			referrer: transaction.referrer ? transaction.referrer : undefined,
			amount: transaction.amount,
			totalAmount: transaction.totalAmount,
			fee: transaction.fee,
			commission: transaction.commission,
			cardNumber: transaction.cardNumber ? transaction.cardNumber : undefined,
			meterId: transaction.meterId ? transaction.meterId : undefined,
			meterName: transaction.meterName ? transaction.meterName : undefined,
			mno: transaction.mno ? transaction.mno : undefined,
			network: transaction.network ? transaction.network : undefined,
			paymentOption: transaction.paymentOption,
			verifiedName: transaction.verifiedName
				? transaction.verifiedName
				: undefined,
			phoneNumber: transaction.phoneNumber
				? transaction.phoneNumber
				: undefined,
			accountName: transaction.accountName
				? transaction.accountName
				: undefined,
			accountNumber: transaction.accountNumber
				? transaction.accountNumber
				: undefined,
			bundleName: transaction.bundleName ? transaction.bundleName : undefined,
			bundleValue: transaction.bundleValue
				? transaction.bundleValue
				: undefined,
		});
		creditTransaction = await creditDataObject.save();
		const creditUniqueId = `CR_${uniqueId}`;
		switch (transaction.type) {
			case "Airtime":
				switch (transaction.network) {
					case "mtn-gh":
						hubtelResponse = await restServices.postHubtelMtnTopup(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					case "vodafone-gh":
						hubtelResponse = await restServices.postHubtelTelecelTopup(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					case "tigo-gh":
						hubtelResponse = await restServices.postHubtelAirtelTigoTopup(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					default:
						break;
				}
				break;
			case "ECG":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to ECG: `
				);
				hubtelResponse = await restServices.postHubtelECGTopup(
					transaction.phoneNumber,
					transaction.meterId,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "DSTV":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to DSTV: `
				);
				hubtelResponse = await restServices.postHubtelPayDstv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GOtv":
			case "GOTV":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to GOtv: `
				);
				hubtelResponse = await restServices.postHubtelPayGOtv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "StarTimesTv":
			case "STARTIMESTV":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to StarTimesTv: `
				);
				hubtelResponse = await restServices.postHubtelPayStarTimeTv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GhanaWater":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to ghana water: `
				);
				hubtelResponse = await restServices.postHubtelPayGhanaWater(
					transaction.accountNumber,
					transaction.amount,
					transaction.phoneNumber,
					creditUniqueId,
					transaction.sessionId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "WalletTopup":
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t completing wallet topup: `
				);

				hubtelResponse = {};

				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "DATA":
				switch (transaction.network) {
					case "mtn-gh":
						hubtelResponse = await restServices.postHubtelMtnDataBundle(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					case "vodafone-gh":
						hubtelResponse = await restServices.postHubtelTelecelDataBundle(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					case "tigo-gh":
						hubtelResponse = await restServices.postHubtelAirtelTigoDataBundle(
							transaction.phoneNumber,
							transaction.amount,
							creditUniqueId
						);
						Log.info(
							`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					default:
						break;
				}
				break;
			case "TELECEL_POSTPAID":
				hubtelResponse = await restServices.postHubtelTelecelPostpaid(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "TELECEL_BROADBAND":
				hubtelResponse = await restServices.postHubtelTelecelBroadband(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			default:
				break;
		}
		if (creditTransaction && hubtelResponse) {
			let Meta = hubtelResponse.Data.Meta;
			creditTransaction.ResponseCode = hubtelResponse.ResponseCode;
			creditTransaction.Description = hubtelResponse.Message;
			creditTransaction.HubtelTransactionId = hubtelResponse.Data.TransactionId;
			creditTransaction.Commission = Meta.Commission
				? Meta.Commission
				: undefined;
			switch (creditTransaction.ResponseCode) {
				case "0001":
					creditTransaction.status = "Pending";
					creditTransaction.statusCode = 411;
					creditTransaction.statusMessage = "Transaction is pending";
					break;
				case "0000":
					creditTransaction.status = "Successful";
					creditTransaction.statusCode = 200;
					creditTransaction.statusMessage = "Transaction is pending";
					break;

				default:
					creditTransaction.status = "Failed";
					creditTransaction.statusCode = 400;
					creditTransaction.statusMessage = "Transaction Failed";
					break;
			}
			if (creditTransaction.isModified) {
				creditTransaction.save();
			}

			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][processCreditTransaction][${transactionId}]\t ${JSON.stringify(
					{
						code: 200,
						message: "Callback processed successfully.",
					}
				)}`
			);
		}
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][postHubtelPaymentCallback][processCreditTransaction][${transactionId}]\t failed committing credit transaction: ${error}`
		);
	}
}
// update DR transaction
async function updateDrTransactionStatus(transaction, Description) {
	Log.info(
		`[postHubtelAirtimeTopup][updateDrTransactionStatus][${transaction.internalReference}] \t updating DR request`
	);
	try {
		const uniqueId =
			transaction.internalReference.split("_")[1] ||
			transaction.internalReference;

		const drTransactionId = `DR_${uniqueId}`;
		let drTransaction = await getTransactionByTransactionId(drTransactionId);
		switch (transaction.ResponseCode) {
			case "0000":
				drTransaction.status = "Successful";
				drTransaction.statusCode = 200;
				drTransaction.statusMessage = "Transaction was successful";
				break;
			case "4080":
				drTransaction.status = "Failed";
				drTransaction.statusCode = 400;
				drTransaction.statusMessage = "Insufficient prepaid balance.";
				break;
			case "2001":
				if (Description === "Invalid MSISDN : Invalid MSISDN") {
					drTransaction.status = "Failed";
					drTransaction.statusCode = 400;
					drTransaction.statusMessage = "Invalid Phone Number";
				}
				if (Description === "65000 : Subscriber does not exit") {
					drTransaction.status = "Failed";
					drTransaction.statusCode = 400;
					drTransaction.statusMessage = "Invalid Phone Number";
				}

				break;

			default:
				drTransaction.status = "Failed";
				drTransaction.statusCode = 400;
				drTransaction.statusMessage = "Transaction Failed";
				break;
		}
		if (drTransaction.isModified) {
			await drTransaction.save();
		}
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup][updateDrTransactionStatus][${transaction.internalReference}] \t error udating drTransactionStatus ${error}`
		);
	}
}
/**helper functions*/
async function getTransactionByTransactionId(transactionId) {
	try {
		const transaction = await Transaction.findOne({
			internalReference: transactionId,
		}).populate({
			path: "createdBy",
			select: "firstName middleName lastName phoneNumber ",
		});
		return transaction;
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
		);
		return null;
	}
}
async function getTransactionByType(transactionId, _type) {
	try {
		const transaction = await Transaction.findOne({
			commonReference: transactionId,
			type: _type,
		}).populate({
			path: "createdBy",
			select: "firstName middleName lastName phoneNumber ",
		});
		return transaction;
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
		);
		return null;
	}
}
async function getRequestByRequestId(requestId) {
	try {
		const request = await WalletTopup.findOne({
			requestId: requestId,
		}).populate({
			path: "createdBy",
			select: "firstName middleName lastName phoneNumber ",
		});
		return request;
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][getRequestByRequestId][${requestId}]\t error : ${error}`
		);
		return null;
	}
}
async function getBalanceTransferByTransferId(transferId) {
	try {
		const transfer = await BalanceTransfer.findOne({
			externalReference: transferId,
		});
		return transfer;
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][getBalanceTransferByTransferId][${transferId}]\t error : ${error}`
		);
		return null;
	}
}
/**helper functions*/

async function referralCodeProcessor(owner, referrer) {
	Log.info(
		`[postHubtelAirtimeTopup.js][referralCodeProcessor] \t processing referral code`
	);
	try {
		let user = await User.findOneAndUpdate(
			{
				_id: new ObjectId(referrer),
				referrals: { $nin: [owner] },
			},
			{ $push: { referrals: owner } },
			{ new: true }
		);
		Log.info(`[postHubtelAirtimeTopup.js][referralCodeProcessor]`);
		if (user) {
			`[postHubtelAirtimeTopup.js][referralCodeProcessor]`;
			user.transactions += 0.4;
			if (user.isModified) {
				await user.save();
			}
		} else {
			Log.info(
				`[postHubtelAirtimeTopup.js][referralCodeProcessor][${referrer}] ******************************** referrer user not found`
			);
		}
	} catch (error) {
		Log.info(
			`[postHubtelAirtimeTopup.js][referralCodeProcessor][error] \t ${error}`
		);
	}
}

async function sendMessages(transaction, req) {
	const currency = "GHS";
	const amount = parseFloat(transaction.amount).toFixed(2);

	const recipientPhoneNumber = transaction.phoneNumber;
	const recipientName = transaction.verifiedName;

	const senderPhoneNumber = transaction.createdBy.phoneNumber;
	const senderName =
		transaction.createdBy.firstName + " " + transaction.createdBy.lastName;

	const from = transaction.account_no;

	const transactionId = transaction.internalReference;

	const support = process.env.DESEAL_CUSTOMER_CARE;

	const trans_id = transaction.transactionId;
	const reference =
		transaction.internalReference.split("_")[1] ||
		transaction.internalReference;

	if (req.body.ResponseCode.toString() === "0000") {
		const recipient_message = `Hi ${
			recipientName ? recipientName : recipientPhoneNumber
		}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${trans_id}. Date: ${new Date().toLocaleString()}. Reference: ${reference}`;

		try {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t sending recipient success message: ${recipient_message}`
			);
			await sendText(recipientPhoneNumber, recipient_message);
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t error sending success message: ${error}`
			);
		}
		try {
			const senders_message = `Hi ${senderName}, your your topup of ${currency} ${amount}. to  Transaction ID: ${trans_id}. Date: ${new Date().toLocaleString()}. Reference: ${reference}`;

			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t sending sender's message: ${senders_message}`
			);
			await sendText(recipientPhoneNumber, recipient_message);
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t error sending success message: ${error}`
			);
		}
	} else {
		const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

		try {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t sending failure message: ${message}`
			);
			await sendText(phoneNumber, message);
		} catch (error) {
			Log.info(
				`[postHubtelAirtimeTopup.js][postHubtelAirtimeTopup][${transactionId}]\t error sending success message: ${error}`
			);
		}
	}
}

module.exports = {
	postWalletTopupCallback,
	postTransactionCallback,
	postHubtelAirtimeTopup,
	postHubtelPaymentCallback,
	postHubtelUtilityCallbackServices,
	postHubtelTransferBalanceCallback,
};
