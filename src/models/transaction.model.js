const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tranactionSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false,
	},
	transactionId: {
		type: String,
		required: true,
	},
	internalReference: {
		type: String,
		required: true,
	},
	commonReference: {
		type: String,
		required: false,
	},
	cr_created: {
		type: Boolean,
		required: false,
	},
	category: {
		type: String,
		required: true,
		enum: ["DR", "CR"],
		default: "DR",
	},
	type: {
		type: String,
		required: false,
		enum: [
			"ECG",
			"Airtime",
			"Billpay",
			"DSTV",
			"GOtv",
			"StarTimesTv",
			"GhanaWater",
		],
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
		required: false,
	},
	phoneNumber: {
		type: String,
		required: false,
	},
	sessionId: {
		type: String,
		required: false,
	},
	accountName: {
		type: String,
		required: false,
	},
	accountNumber: {
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
		type: Number,
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
	PaymentResponseCode: {
		type: String,
		required: false,
	},
	PaymentStatus: {
		type: String,
		required: false,
	},
	CheckoutId: {
		type: String,
		required: false,
	},
	SalesInvoiceId: {
		type: String,
		required: false,
	},
	CustomerPhoneNumber: {
		type: String,
		required: false,
	},
	PaymentAmount: {
		type: Number,
		required: false,
	},
	PaymentDetails: {
		type: Object,
		required: false,
	},
	PaymentDescription: {
		type: String,
		required: false,
	},

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", tranactionSchema);
