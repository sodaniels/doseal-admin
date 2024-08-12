const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportIssueSchema = new Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	title: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	reference: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReportIssue", reportIssueSchema);
