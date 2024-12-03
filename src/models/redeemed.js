const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const redeemedSchema = new Schema({
	redeemedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false,
	},
	referrals: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Redeemed", redeemedSchema);
