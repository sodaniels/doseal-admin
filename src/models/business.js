const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const businessSchema = new Schema({

	businessId: {
		type: String,
		required: true,
	},
	businessName: {
		type: String,
		required: true,
	},
	businessLogo: {
		type: String,
		required: false,
	},
	physicalLocation: {
		type: String,
		required: false,
	},
	email: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ["Active", "Inactive", "Blocked"],
		default: "Inactive",
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Business", businessSchema);
