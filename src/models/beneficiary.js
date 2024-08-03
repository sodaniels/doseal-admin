const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const beneficiarySchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	user_id: {
		type: String,
		required: true,
	},
	paymentMode: {
		type: String,
		required: true,
	},

	country: {
		type: String,
		required: true,
	},
	flag: {
		type: String,
		required: false,
	},
	currencyCode: {
		type: String,
		required: true,
	},
	bankName: {
		type: String,
		required: false,
	},
	accountName: {
		type: Object,
		required: false,
	},
	accountNumber: {
		type: String,
		required: false,
	},
	recipient_name: {
		type: String,
		required: false,
	},
	recipientPhoneNumber: {
		type: String,
		required: false,
	},
	mno: {
		type: String,
		required: false,
	},
	recipient_country_iso: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Benefiary", beneficiarySchema);
