const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tvStreamsSchema = new Schema({
	accountNumber: { type: String, required: true },
	verifiedName: { type: Object, required: false },
	type: { type: Object, required: false },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TvStream", tvStreamsSchema);
