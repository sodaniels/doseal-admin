const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	deviceUniqueId: {
		type: String,
		required: false,
	},
	firstName: {
		type: String,
		required: false,
		trim: true,
	},
	middleName: {
		type: String,
		required: false,
		trim: true,
	},
	lastName: {
		type: String,
		required: false,
		trim: true,
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true,
	},
	role: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: false,
		trim: true,
	},
	password: {
		type: String,
		required: false,
	},
	permissions: {
		type: Object,
		required: false,
	},
	idType: {
		type: String,
		required: false,
	},
	idNumber: {
		type: String,
		required: false,
	},
	idExpiryDate: {
		type: String,
		required: false,
	},
	idPhoto: {
		type: String,
		required: false,
	},
	preferredPayment: {
		type: Object,
		required: false,
	},
	registration: {
		type: String,
		enum: ["INITIAL", "COMPLETED"],
		default: "INITIAL",
	},
	status: {
		type: String,
		enum: ["Active", "Inactive", "Blocked"],
		default: "Inactive",
	},
	balance: {
		type: Number,
		default: 0,
		required: false,
	},
	nameFromTelco: {
		type: Boolean,
		required: false,
	},
	isBiometicAuthentication: {
		type: Boolean,
		required: false,
	},
	lastloggedIn: {
		type: Date,
		required: false,
	},
	authCode: {
		type: String,
		required: false,
	},
	accessMode: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
