const axios = require("axios");

const User = require("../../models/user");
const io = require("../../../socket");
const { Log } = require("../../helpers/Log");
const WalletTopup = require("../../models/wallet-topup.model");
const Transaction = require("../../models/transaction.model");
const Meter = require("../../models/meter.model");
const { sendText } = require("../../helpers/sendText");
const { rand10Id } = require("../../helpers/randId");
const RestServices = require("../../services/api/RestServices");
const restServices = new RestServices();

// post hubtel airtime topup transaction
async function postHubtelAirtimeTopup(req, res) {
	let saveTransaction, transactionId;
	Log.info("[CallbackController.js][postHubtelAirtimeTopup]\tIP: " + req.ip);
	Log.info(
		"[CallbackController.js][postHubtelAirtimeTopup]\tCallback Transaction: " +
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

		try {
			if (transaction.isModified) {
				await transaction.save();
				// update debit request for transaction
				updateDrTransactionStatus(transaction, Data.Description);
			}
			Log.info(
				"[CallbackController.js][postHubtelAirtimeTopup]\t Emitting single topup update: "
			);
			Log.info(
				"[CallbackController.js][postBuyCredit]\t Emitting wallet update: "
			);
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[CallbackController.js][postHubtelAirtimeTopup]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postHubtelAirtimeTopup]\t error emitting walletTopUp update: `,
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
								"[CallbackController.js][postHubtelAirtimeTopup]\t Emitting balance update: "
							);
							try {
								io.getIO().emit("balanceUpdate", user.balance);
								Log.info(
									"[CallbackController.js][postHubtelAirtimeTopup]\t Emitted balance update: "
								);
							} catch (error) {
								Log.info(
									`[CallbackController.js][postHubtelAirtimeTopup]\t error emitting balance update: `,
									error
								);
							}
						}
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}

			try {
				io.getIO().emit("excerptTransData", transaction);
				Log.info(
					"[CallbackController.js][postBuyCredit]\t Emitted wallet update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postBuyCredit]\t error emitting wallet update: `,
					error
				);
			}
		} catch (error) {
			Log.info(
				`[CallbackController.js][postHubtelAirtimeTopup][${transactionId}]\t error saving callback data: ${error}`
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
		"[CallbackController.js][postHubtelUtilityCallbackServices]\tIP: " + req.ip
	);
	Log.info(
		"[CallbackController.js][postHubtelUtilityCallbackServices]\tCallback Transaction: " +
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
				await transaction.save();
				// update debit request for transaction
				updateDrTransactionStatus(transaction, Data.Description);
			}
			Log.info(
				"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitting single topup update: "
			);
			Log.info(
				"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitting wallet update: "
			);
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postHubtelUtilityCallbackServices]\t error emitting walletTopUp update: `,
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
								"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitting balance update: "
							);
							try {
								io.getIO().emit("balanceUpdate", user.balance);
								Log.info(
									"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitted balance update: "
								);
							} catch (error) {
								Log.info(
									`[CallbackController.js][postHubtelUtilityCallbackServices]\t error emitting balance update: `,
									error
								);
							}
						}
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}

			try {
				io.getIO().emit("excerptTransData", transaction);
				Log.info(
					"[CallbackController.js][postHubtelUtilityCallbackServices]\t Emitted wallet update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postHubtelUtilityCallbackServices]\t error emitting wallet update: `,
					error
				);
			}
		} catch (error) {
			Log.info(
				`[CallbackController.js][postHubtelUtilityCallbackServices][${transactionId}]\t error saving callback data: ${error}`
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
	Log.info("[CallbackController.js][walletTopupCallback]\tIP: " + req.ip);
	Log.info(
		"[CallbackController.js][walletTopupCallback]\tCallback Request: " +
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
				"[CallbackController.js][postWalletTopupCallback]\t Emitting single topup update: "
			);
			try {
				io.getIO().emit("singleItemTopUpDataUpdate", request);
				Log.info(
					"[CallbackController.js][postWalletTopupCallback]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postWalletTopupCallback]\t error emitting walletTopUp update: `,
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
							"[CallbackController.js][postWalletTopupCallback]\t Emitting balance update: "
						);
						try {
							io.getIO().emit("balanceUpdate", user.balance);
							Log.info(
								"[CallbackController.js][postWalletTopupCallback]\t Emitted balance update: "
							);
						} catch (error) {
							Log.info(
								`[CallbackController.js][postWalletTopupCallback]\t error emitting balance update: `,
								error
							);
						}
					} catch (error) {
						Log.info(
							`[CallbackController.js][getRequestByReference][${requestId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your transfer of ${currency} ${amount} from (${from}) to your wallet has been processed successfully. Request ID: ${requestId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[CallbackController.js][getRequestByReference][${requestId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][getRequestByReference][${requestId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `We could not transfer ${currency} ${amount} from (${from}) to your wallet. The transfer failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[CallbackController.js][getRequestByReference][${requestId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][getRequestByReference][${requestId}]\t error sending success message: ${error}`
						);
					}
				}
			}
		} catch (error) {
			Log.info(
				`[CallbackController.js][getRequestByReference][${requestId}]\t error saving callback data: ${error}`
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
	Log.info("[CallbackController.js][postHubtelPaymentCallback]\tIP: " + req.ip);
	Log.info(
		"[CallbackController.js][postHubtelPaymentCallback]\tCallback Transaction: " +
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
						`[CallbackController.js][postHubtelPaymentCallback][${transactionId}]\t payment callback saved`
					);
					await transaction.save();

					if (req.body.ResponseCode === "0000") {
						commitCreditTransaction(transaction);
					}
				}
			} catch (error) {
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][${transactionId}]\t error saving callback data: ${error}`
				);
			}
		}

		res.status(200).json({
			code: 200,
			message: "Callback processed successfully.",
		});
	} catch (error) {
		Log.info(
			`[CallbackController.js][postHubtelPaymentCallback][${transactionId}]\t error processing payment callback: ${error}`
		);
	}
}

async function postTransactionCallback(req, res) {
	let saveTransaction, transactionId;
	Log.info("[CallbackController.js][postTransactionCallback]\tIP: " + req.ip);
	Log.info(
		"[CallbackController.js][postTransactionCallback]\tCallback Transaction: " +
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
				"[CallbackController.js][postTransactionCallback]\t Emitting single topup update: "
			);
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[CallbackController.js][postTransactionCallback]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postTransactionCallback]\t error emitting walletTopUp update: `,
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
								"[CallbackController.js][postTransactionCallback]\t Emitting balance update: "
							);
							try {
								io.getIO().emit("balanceUpdate", user.balance);
								Log.info(
									"[CallbackController.js][postTransactionCallback]\t Emitted balance update: "
								);
							} catch (error) {
								Log.info(
									`[CallbackController.js][postTransactionCallback]\t error emitting balance update: `,
									error
								);
							}
						}
					} catch (error) {
						Log.info(
							`[CallbackController.js][getRequestByReference][${transactionId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[CallbackController.js][postTransactionCallback][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postTransactionCallback][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[CallbackController.js][postTransactionCallback][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postTransactionCallback][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}
		} catch (error) {
			Log.info(
				`[CallbackController.js][postTransactionCallback][${transactionId}]\t error saving callback data: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}

async function commitCreditTransaction(transaction) {
	let hubtelResponse, creditTransaction;
	const transactionId = transaction.internalReference;
	try {
		const creditTransactionId = rand10Id().toString();

		Log.info(
			`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${transactionId}]\t committing credit transaction`
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
			amount: transaction.amount,
			cardNumber: transaction.cardNumber ? transaction.cardNumber : undefined,
			meterId: transaction.meterId ? transaction.meterId : undefined,
			meterName: transaction.meterName ? transaction.meterName : undefined,
			mno: transaction.mno ? transaction.mno : undefined,
			network: transaction.network ? transaction.network : undefined,
			paymentOption: transaction.paymentOption,
			phoneNumber: transaction.phoneNumber
				? transaction.phoneNumber
				: undefined,
			accountName: transaction.accountName
				? transaction.accountName
				: undefined,
			accountNumber: transaction.accountNumber
				? transaction.accountNumber
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to ECG: `
				);
				hubtelResponse = await restServices.postHubtelECGTopup(
					transaction.phoneNumber,
					transaction.meterId,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				try {
					Log.info(
						`[CallbackController.js][postHubtelPaymentCallback][${creditUniqueId}]\t storing meter information if not already present`
					);
					if (hubtelResponse) {
						const meterExists = await Meter.findOne({
							createdBy: transaction.createdBy._id,
							phoneNumber: transaction.phoneNumber,
							meterId: transaction.meterId,
						});
						if (!meterExists) {
							const prepareMeter = new Meter({
								createdBy: transaction.createdBy._id,
								phoneNumber: transaction.phoneNumber,
								meterName: transaction.meterName,
								meterId: transaction.meterId,
							});
							const storeMeter = await prepareMeter.save();
							if (storeMeter) {
								Log.info(
									`[CallbackController.js][postHubtelPaymentCallback][${transaction.meterId}][${transaction.phoneNumber}]\t new meter information stored`
								);
							}
						}
					}
				} catch (error) {
					Log.info(
						`[CallbackController.js][postHubtelPaymentCallback][${creditUniqueId}]\t error ocurred while storing meter information: ${error}`
					);
				}
				break;
			case "DSTV":
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to DSTV: `
				);
				hubtelResponse = await restServices.postHubtelPayDstv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GOtv":
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to GOtv: `
				);
				hubtelResponse = await restServices.postHubtelPayGOtv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "StarTimesTv":
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to StarTimesTv: `
				);
				hubtelResponse = await restServices.postHubtelPayStarTimeTv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GhanaWater":
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t initiating request to ghana water: `
				);
				hubtelResponse = await restServices.postHubtelPayGhanaWater(
					transaction.accountNumber,
					transaction.amount,
					transaction.phoneNumber,
					creditUniqueId,
					transaction.sessionId
				);
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "WalletTopup":
				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t completing wallet topup: `
				);

				hubtelResponse = {};

				Log.info(
					`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[CallbackController.js][postHubtelPaymentCallback][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
								hubtelResponse
							)}`
						);
						break;
					default:
						break;
				}
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
				`[CallbackController.js][postHubtelPaymentCallback][processCreditTransaction][${transactionId}]\t ${JSON.stringify(
					{
						code: 200,
						message: "Callback processed successfully.",
					}
				)}`
			);
		}
	} catch (error) {
		Log.info(
			`[CallbackController.js][postHubtelPaymentCallback][processCreditTransaction][${transactionId}]\t failed committing credit transaction: ${error}`
		);
	}
}

async function updateDrTransactionStatus(transaction, Description) {
	Log.info(
		`[CallbackController][updateDrTransactionStatus][${transaction.internalReference}] \t updating DR request`
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
			`[CallbackController][updateDrTransactionStatus][${transaction.internalReference}] \t error udating drTransactionStatus ${error}`
		);
	}
}

//helper functions
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
			`[CallbackController.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
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
			`[CallbackController.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
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
			`[CallbackController.js][getRequestByRequestId][${requestId}]\t error : ${error}`
		);
		return null;
	}
}

module.exports = {
	postWalletTopupCallback,
	postTransactionCallback,
	postHubtelAirtimeTopup,
	postHubtelPaymentCallback,
	postHubtelUtilityCallbackServices,
};
