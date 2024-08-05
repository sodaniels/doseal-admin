const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema({
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
		required: true,
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
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BuyCredit", walletSchema);
