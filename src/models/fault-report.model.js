const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const faultReportSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	category: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FaultReport", faultReportSchema);
