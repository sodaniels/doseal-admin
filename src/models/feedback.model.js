const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feeedbackSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	rating: {
		type: Number,
		required: true,
	},
	message: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feeedbackSchema);
