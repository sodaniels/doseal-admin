const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contactUsSchema = new Schema({
	fullName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	website: {
		type: String,
		required: false,
	},
	message: {
		type: String,
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContactUs", contactUsSchema);
