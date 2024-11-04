const cron = require("node-cron");

const Transaction = require("../models/transaction.model");
const { Log } = require("../helpers/Log");
const RestServices = require("../services/api/RestServices");
const restServices = new RestServices();
const callbackController = require("../controllers/v1/CallbackController");
const apiController = require("../controllers/v1/ApiController");
const ServiceCode = require("../constants/serviceCode");
const { rand10Id } = require("../helpers/randId");
const io = require("../../socket");

async function connectAndStartCron() {
	cron.schedule("*/60 * * * *", async () => {
		if (process.env.ENVIRONMENT !== "development") {
			
			// Check transactions every one hour and check the status after  1 hour
			Log.info(
				`[cronJobs.crons.js][connectAndStartCron]\t checking for pending transactions and balance transfer`
			);
			try {
				await getPendingTransactions();
			} catch (error) {
				Log.info(
					`[cronJobs.crons.js][connectAndStartCron]\t error getting pending transactions`
				);
			}

			try {
				await apiController.postTransferBalance();
			} catch (error) {
				Log.info(
					`[cronJobs.crons.js][connectAndStartCron]\t error getting calling postTransferBalance`
				);
			}
		}
	});
}

async function getPendingTransactions() {
	let transactionId, hubtelResponse, transaction;
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

	try {
		// Fetch transactions for today
		const transactions = await Transaction.aggregate([
			{
				$match: {
					statusCode: 411,
					createdAt: {
						$gte: currentDate, // Transaction created today
						$lte: fiveMinutesAgo,
					},
				},
			},
		]);

		transactions.forEach(async (item) => {
			Log.info(
				`[cronJobs.crons.js][getPendingTransactions] checking status for ${item.internalReference} `
			);
			try {
				hubtelResponse = await restServices.getTransactionStatusCheckService(
					item.internalReference
				);
				console.log("hubtelResponse:" + JSON.stringify(hubtelResponse));
				if (hubtelResponse) {
					Log.info(
						`[cronJobs.crons.js][getPendingTransactions] status check results:` +
							JSON.stringify(hubtelResponse)
					);
					transactionId = item.internalReference;
					let Data = hubtelResponse.data;

					transaction = await getTransactionByTransactionId(transactionId);
					if (
						hubtelResponse.responseCode === "0000" &&
						transaction &&
						transaction.statusCode === 411
					) {
						switch (Data.status) {
							case "Paid":
								/** hubtel */
								transaction.PaymentResponseCode = "0000";
								transaction.PaymentStatus = "Success";
								transaction.amountAfterCharges = Data.amountAfterCharges;
								transaction.Charges = Data.charges;
								transaction.PaymentAmount = Data.amount;
								transaction.PaymentDetails = Data.paymentMethod;
								transaction.ExternalTransactionId = Data.transactionId;
								/** in house */
								transaction.status = "Successful";
								transaction.statusCode = 200;
								transaction.statusMessage = "Transaction was successful";
								transaction.cr_created = true;
								break;
							case "Unpaid":
								/** hubtel */
								transaction.PaymentResponseCode = "400";
								transaction.PaymentStatus = "Failed";
								transaction.amountAfterCharges = Data.amountAfterCharges;
								transaction.Charges = Data.charges;
								transaction.PaymentAmount = Data.amount;
								transaction.PaymentDetails = Data.paymentMethod;
								transaction.ExternalTransactionId = Data.transactionId;
								/** in house */
								transaction.status = "Failed";
								transaction.statusCode = 400;
								transaction.statusMessage = "Payment Failed";
								break;
							default:
								break;
						}
						try {
							if (transaction.isModified) {
								Log.info(
									`[cronJobs.crons.js][getPendingTransactions][${transactionId}]\t payment callback saved`
								);
								await transaction.save();

								try {
									io.getIO().emit("singleTransactionUpdate", transaction);
								} catch (error) {}

								if (Data.status === "Paid") {
									commitCreditTransaction(transaction);
								}
							}
						} catch (error) {
							Log.info(
								`[cronJobs.crons.js][getPendingTransactions][${transactionId}]\t error saving callback data: ${error}`
							);
						}
					} else {
						transaction.status = "Failed";
						transaction.statusCode = 400;
						transaction.statusMessage = "Payment Failed";
						if (transaction.isModified) {
							await transaction.save();
							try {
								io.getIO().emit("singleTransactionUpdate", transaction);
							} catch (error) {
								Log.info(
									`[cronJobs.crons.js][getPendingTransactions][${transactionId}]\t error emitting status check transaction: ${error}`
								);
							}
						}
					}
				}
			} catch (error) {
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions] error checking status: ${error}`
				);
			}
		});
	} catch (error) {
		Log.info(
			`[cronJobs.crons.js][getPendingTransactions] error occurred checking transaction status: ${error}`
		);
	}
}

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
			`[cronJobs.crons.js][getTransactionByTransactionId][${transactionId}]\t error : ${error}`
		);
		return null;
	}
}

async function commitCreditTransaction(transaction) {
	let hubtelResponse, creditTransaction;
	const transactionId = transaction.internalReference;
	try {
		const creditTransactionId = rand10Id().toString();

		Log.info(
			`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${transactionId}]\t committing credit transaction`
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
			totalAmount: transaction.totalAmount,
			fee: transaction.fee,
			commission: transaction.commission,
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t initiating request to ECG: `
				);
				hubtelResponse = await restServices.postHubtelECGTopup(
					transaction.phoneNumber,
					transaction.meterId,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				try {
					Log.info(
						`[cronJobs.crons.js][getPendingTransactions][${creditUniqueId}]\t storing meter information if not already present`
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
									`[cronJobs.crons.js][getPendingTransactions][${transaction.meterId}][${transaction.phoneNumber}]\t new meter information stored`
								);
							}
						}
					}
				} catch (error) {
					Log.info(
						`[cronJobs.crons.js][getPendingTransactions][${creditUniqueId}]\t error ocurred while storing meter information: ${error}`
					);
				}
				break;
			case "DSTV":
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t initiating request to DSTV: `
				);
				hubtelResponse = await restServices.postHubtelPayDstv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GOtv":
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t initiating request to GOtv: `
				);
				hubtelResponse = await restServices.postHubtelPayGOtv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "StarTimesTv":
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t initiating request to StarTimesTv: `
				);
				hubtelResponse = await restServices.postHubtelPayStarTimeTv(
					transaction.accountNumber,
					transaction.amount,
					creditUniqueId
				);
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "GhanaWater":
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t initiating request to ghana water: `
				);
				hubtelResponse = await restServices.postHubtelPayGhanaWater(
					transaction.accountNumber,
					transaction.amount,
					transaction.phoneNumber,
					creditUniqueId,
					transaction.sessionId
				);
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
						hubtelResponse
					)}`
				);
				break;
			case "WalletTopup":
				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t completing wallet topup: `
				);

				hubtelResponse = {};

				Log.info(
					`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
							`[cronJobs.crons.js][getPendingTransactions][commitCreditTransaction][${creditUniqueId}]\t hubtelResponse: ${JSON.stringify(
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
				`[cronJobs.crons.js][getPendingTransactions][processCreditTransaction][${transactionId}]\t ${JSON.stringify(
					{
						code: 200,
						message: "Callback processed successfully.",
					}
				)}`
			);
		}
	} catch (error) {
		Log.info(
			`[cronJobs.crons.js][getPendingTransactions][processCreditTransaction][${transactionId}]\t failed committing credit transaction: ${error}`
		);
	}
}

module.exports = { connectAndStartCron };
