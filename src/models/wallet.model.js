const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	phoneNumber: {
		type: String,
		required: true,
	},
	mno: {
		type: String,
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallet", walletSchema);
