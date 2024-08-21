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

async function calculateCompositeFee(type, _amount) {
	try {
		const amount = Number(_amount);
		switch (type.toUpperCase()) {
			case "mtn-gh":
				return processMtnTransactionHubtelFee(amount);
				break;
			case "vodafone-gh":
				return processVodafoneTransactionHubtelFee(amount);
				break;
			case "tigo-gh":
				return processAirtelTigoTransactionHubtelFee(amount);
				break;
			case "bank-card":
				return processSendToBankTransactionHubtelFee(amount);
				break;
			default:
				return processDefaultFee(amount);
				break;
		}
	} catch (error) {
		Log.info(`[calculateFee.js][calculateCompositeFee] \t error: ${error}`);
	}
}

async function processDosealFee(amount) {
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

function processMtnTransactionHubtelFee(amount) {
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

function processVodafoneTransactionHubtelFee(amount) {
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

function processAirtelTigoTransactionHubtelFee(amount) {
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

function processSendToBankTransactionHubtelFee(amount) {
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

function processDefaultFee(amount) {
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
				return orderedResults;
				break;
			case "Airtime":
				orderedResults.phoneNumber = results.phoneNumber;
				orderedResults.amount = results.amount;
				orderedResults.network = results.network;
				orderedResults.meterName = results.meterName;
				orderedResults.meterId = results.meterId;
				orderedResults.type = results.type;
				orderedResults.fee = results.fee;
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

module.exports = {
	hashTransaction,
	verifyTransaction,
	calculateCompositeFee,
	processDosealFee,
	orderTransactionResults,
};
