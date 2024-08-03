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
		required: true,
	},
	account_no: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: false,
	},
	statusCode: {
		type: Number,
		required: false,
	},
	statusMessage: {
		type: String,
		required: false,
	},
	externalReference: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WalletTopup", pageSchema);
