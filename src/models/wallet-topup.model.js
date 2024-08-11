const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pageSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	requestId: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	mno: {
		type: String,
		required: false,
	},
	account_no: {
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
	Description: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WalletTopup", pageSchema);
