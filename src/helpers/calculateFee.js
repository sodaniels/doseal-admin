const crypto = require("crypto");
const { Log } = require("../helpers/Log");

function hashTransaction(request) {
	const transactionString = JSON.stringify(request);
	return crypto.createHash("sha256").update(transactionString).digest("hex");
}

function verifyTransaction(request, originalHash) {
	const transactionString = JSON.stringify(request);
	const newHash = crypto
		.createHash("sha256")
		.update(transactionString)
		.digest("hex");
	return newHash.toUpperCase() === originalHash;
}

async function calculateCompositeFee(_amount, type) {
	try {
		const amount = Number(_amount);
		return processDefaultFee(amount);
	} catch (error) {
		Log.info(`[calculateFee.js][calculateCompositeFee] \t error: ${error}`);
	}
}

// "ECG",
// "Airtime",
// "Billpay",
// "DSTV",
// "GOtv",
// "GOTV",
// "StarTimesTv",
// "STARTIMESTV",
// "GhanaWater",
// "WalletTopup",
// "DATA",
// "TELECEL_POSTPAID",
// "TELECEL_BROADBAND",

async function processDosealFee(amount, type) {
	switch (type) {
		case "ECG":
		case "DSTV":
		case "GOtv":
		case "GOTV":
		case "StarTimesTv":
		case "STARTIMESTV":
		case "GhanaWater":
		case "TELECEL_POSTPAID":
		case "TELECEL_BROADBAND":
			if (amount <= 0) {
			} else if (amount >= 0.01 && amount <= 1) {
				return 0.01;
			} else if (amount >= 1.01 && amount <= 10) {
				return 0.1;
			} else if (amount >= 10.01 && amount <= 50) {
				return 0.5;
			} else if (amount >= 50.01 && amount <= 500) {
				return 0.01 * amount;
			} else if (amount >= 500.01 && amount <= 1000) {
				return 5;
			} else if (amount >= 1000.01 && amount <= 2000) {
				return 10;
			} else if (amount > 2000.01) {
				return 0.01 * amount;
			}
			break;

		default:
			return 0;
			break;
	}
}

function processGOtvDstvEcgFee(amount) {
	if (amount <= 0) {
		return 0;
	} else if (amount >= 0.01 && amount <= 1) {
		return 0.01;
	} else if (amount >= 1.01 && amount <= 10) {
		return 0.1;
	} else if (amount >= 10.01 && amount <= 50) {
		return 0.5;
	} else if (amount >= 50.01 && amount <= 500) {
		return 0.01 * amount;
	} else if (amount >= 500.01 && amount <= 1000) {
		return 5;
	} else if (amount >= 1000.01 && amount <= 2000) {
		return 10;
	} else if (amount > 2000.01) {
		return 0.01 * amount;
	}
}

function processDefaultFee(amount, type) {
	if (amount <= 0) {
		return 0;
	} else if (amount >= 0.01 && amount <= 1) {
		return 0.01;
	} else if (amount >= 1.01 && amount <= 10) {
		return 0.1;
	} else if (amount >= 10.01 && amount <= 50) {
		return 0.5;
	} else if (amount >= 50.01 && amount <= 500) {
		return 0.01 * amount;
	} else if (amount >= 500.01 && amount <= 1000) {
		return 5;
	} else if (amount >= 1000.01 && amount <= 2000) {
		return 10;
	} else if (amount > 2000.01) {
		return 0.01 * amount;
	}
}

function orderTransactionResults(results) {
	try {
		let orderedResults = {};
		switch (results.type) {
			case "ECG":
				orderedResults.phoneNumber = results.phoneNumber;
				orderedResults.amount = results.amount;
				orderedResults.meterName = results.meterName;
				orderedResults.meterId = results.meterId;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
				orderedResults.totalAmount = results.totalAmount;
				return orderedResults;
				break;
			case "Airtime":
				orderedResults.phoneNumber = results.phoneNumber;
				orderedResults.amount = results.amount;
				orderedResults.network = results.network;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
				orderedResults.totalAmount = results.totalAmount;
				return orderedResults;
				break;
			case "DATA":
				orderedResults.phoneNumber = results.phoneNumber;
				orderedResults.network = results.network;
				orderedResults.accountNumber = results.accountNumber;
				orderedResults.id = results.id;
				orderedResults.bundleName = results.bundleName;
				orderedResults.bundleValue = results.bundleValue;
				orderedResults.amount = results.amount;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
				orderedResults.totalAmount = results.totalAmount;
				return orderedResults;
				break;
			case "DSTV":
			case "GOtv":
			case "StarTimesTv":
				orderedResults.accountName = results.accountName;
				orderedResults.amount = results.amount;
				orderedResults.accountNumber = results.accountNumber;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
				orderedResults.totalAmount = results.totalAmount;
				return orderedResults;
				break;
			case "GhanaWater":
				orderedResults.accountName = results.accountName;
				orderedResults.amount = results.amount;
				orderedResults.accountNumber = results.accountNumber;
				orderedResults.phoneNumber = results.phoneNumber;
				orderedResults.sessionId = results.sessionId;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
				orderedResults.totalAmount = results.totalAmount;
				return orderedResults;
				break;
			default:
				break;
		}

		return orderedResults;
	} catch (error) {
		Log.info(`[calculateFee.js][orderTransactionResults] error: ${error}`);
	}
}

async function processDosealCommission(amount, type, network = null) {
	try {
		switch (type) {
			case "ECG":
			case "DSTV":
			case "GOtv":
				return 0.01 * amount;
				break;
			case "Airtime":
				if (network === "mtn-gh") {
					return 0.06 * amount;
				}
				if (network === "vodafone-gh") {
					return 0.08 * amount;
				}
				if (network === "tigo-gh") {
					return 0.08 * amount;
				}
				break;
			case "DATA":
				if (network === "mtn-gh") {
					return 0.06 * amount;
				}
				if (network === "vodafone-gh") {
					return 0.04 * amount;
				}
				if (network === "tigo-gh") {
					return 0.05 * amount;
				}
				break;

			default:
				return 0;
				break;
		}
	} catch (error) {
		Log.info(`[calculateFee.js][orderTransactionResults] error : ${error}`);
	}
}

module.exports = {
	hashTransaction,
	verifyTransaction,
	calculateCompositeFee,
	processDosealFee,
	orderTransactionResults,
	processDosealCommission,
};
