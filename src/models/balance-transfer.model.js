
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceTransferSchema = new Schema({
    amount: {
		type: Number,
		required: true,
	},
    status: {
		type: String,
		required: false,
		enum: ["Pending", "Successful", "Failed"],
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
		default: "Transfer is pending",
	},
	externalReference: {
		type: String,
		required: false,
	},
	ResponseCode: {
		type: String,
		required: false,
	},
    updatedBy: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BalanceTransfer", balanceTransferSchema);
