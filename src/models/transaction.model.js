const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tranactionSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
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
	mno: {
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
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tranaction", tranactionSchema);
