const axios = require("axios");

const User = require("../../models/user");
const io = require("../../../socket");
const { Log } = require("../../helpers/Log");
const WalletTopup = require("../../models/wallet-topup.model");
const Transaction = require("../../models/transaction.model");
const { sendText } = require("../../helpers/sendText");

// post hubtel airtime topup transaction
async function postHubtelAirtelTopup(req, res) {
	let saveTransaction, transactionId;
	Log.info("[CallbackController.js][postHubtelAirtelTopup]\tIP: " + req.ip);
	Log.info(
		"[CallbackController.js][postHubtelAirtelTopup]\tCallback Transaction: " +
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
			}
			Log.info(
				"[CallbackController.js][postHubtelAirtelTopup]\t Emitting single topup update: "
			);
			Log.info("[ApiController.js][postBuyCredit]\t Emitting wallet update: ");
			try {
				// io.getIO().emit("transactionUpdate", transaction);
				io.getIO().emit("excerptTransData", transaction);
				Log.info("[ApiController.js][postBuyCredit]\t Emitted wallet update: ");
			} catch (error) {
				Log.info(
					`[ApiController.js][postBuyCredit]\t error emitting wallet update: `,
					error
				);
			}
			try {
				io.getIO().emit("singleTransactionUpdate", transaction);
				Log.info(
					"[CallbackController.js][postHubtelAirtelTopup]\t Emitted single topup update: "
				);
			} catch (error) {
				Log.info(
					`[CallbackController.js][postHubtelAirtelTopup]\t error emitting walletTopUp update: `,
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
								"[CallbackController.js][postHubtelAirtelTopup]\t Emitting balance update: "
							);
							try {
								io.getIO().emit("balanceUpdate", user.balance);
								Log.info(
									"[CallbackController.js][postHubtelAirtelTopup]\t Emitted balance update: "
								);
							} catch (error) {
								Log.info(
									`[CallbackController.js][postHubtelAirtelTopup]\t error emitting balance update: `,
									error
								);
							}
						}
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t error updating balance: ${error}`
						);
					}

					const message = `Hi ${name}, your acccount has been topup with the amount of ${currency} ${amount}. Transaction ID: ${transactionId}. Date: ${new Date().toLocaleString()}. Reference: ${
						req.body.externalReference
					}`;

					try {
						Log.info(
							`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t sending success message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t error sending success message: ${error}`
						);
					}
				} else {
					const message = `Your topup of ${currency} ${amount} to your account failed. For more information, please contact customer support on ${support} `;

					try {
						Log.info(
							`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t sending failure message: ${message}`
						);
						await sendText(phoneNumber, message);
					} catch (error) {
						Log.info(
							`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t error sending success message: ${error}`
						);
					}
				}
			}
		} catch (error) {
			Log.info(
				`[CallbackController.js][postHubtelAirtelTopup][${transactionId}]\t error saving callback data: ${error}`
			);
		}
	}

	res.status(200).json({
		code: 200,
		message: "Callback processed successfully.",
	});
}

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

/**single get pull */
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

async function getTransactionByTransactionId(transactionId) {
	try {
		const request = await Transaction.findOne({
			internalReference: transactionId,
		}).populate({
			path: "createdBy",
			select: "firstName middleName lastName phoneNumber ",
		});
		return request;
	} catch (error) {
		Log.info(
			`[CallbackController.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
		);
		return null;
	}
}

module.exports = {
	postWalletTopupCallback,
	postTransactionCallback,
	postHubtelAirtelTopup,
};
