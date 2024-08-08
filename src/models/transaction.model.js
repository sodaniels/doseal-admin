const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tranactionSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	transactionId: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: false,
		enum: ["Prepaid", "Postpaid", "Airtime", "Billpay"],
		default: "Prepaid",
	},
	amount: {
		type: Number,
		required: true,
	},
	meterId: {
		type: String,
		required: false,
	},
	meterName: {
		type: String,
		required: false,
	},
	mno: {
		type: String,
		required: false,
	},
	paymentOption: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: String,
		required: false,
	},
	cardNumber: {
		type: String,
		required: false,
	},
	mno: {
		type: String,
		required: false,
	},
	network: {
		type: String,
		required: false,
	},
	status: {
		type: String,
		required: false,
		enum: ["Pending", "Successful", "Failed", "Refunded"],
		default: "Pending",
	},
	statusCode: {
		type: Number,
		required: false,
		default: 411,
	},
	statusMessage: {
		type: String,
		required: false,
		default: "Transaction is pending",
	},
	externalReference: {
		type: String,
		required: false,
	},
	ResponseCode: {
		type: String,
		required: false,
	},
	Commission: {
		type: String,
		required: false,
	},
	Description: {
		type: String,
		required: false,
	},
	HubtelTransactionId: {
		type: String,
		required: false,
	},
	AmountDebited: {
		type: Number,
		required: false,
	},
	Charges: {
		type: Number,
		required: false,
	},
	ExternalTransactionId: {
		type: String,
		required: false,
	},

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tranaction", tranactionSchema);
