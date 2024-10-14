const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
	date: {
		type: Date,
		required: true,
	},
	UniqueId: {
		type: String,
		required: true,
	},
	Model: {
		type: String,
		required: false,
	},
	FirstInstallTime: {
		type: String,
		required: false,
	},
	DeviceType: {
		type: String,
		required: false,
	},
	MacAddress: {
		type: String,
		required: false,
	},
	ReadableVersion: {
		type: String,
		required: false,
	},
	UserAgent: {
		type: String,
		required: false,
	},
	isEmulator: {
		type: String,
		required: false,
	},
	isLocationEnabled: {
		type: String,
		required: false,
	},
	isPinOrFingerprintSet: {
		type: String,
		required: false,
	},
	Manufacturer: {
		type: String,
		required: false,
	},
	IpAddress: {
		type: String,
		required: false,
	},
	updatedDate: {
		type: Date,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Device", deviceSchema);
