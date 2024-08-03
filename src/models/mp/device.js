const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
	date: {
		type: Date,
		required: true,
	},
	uuid: {
		type: String,
		required: true,
	},
	model: {
		type: String,
		required: false,
	},
	osVersion: {
		type: String,
		required: false,
	},
	sdkVersion: {
		type: String,
		required: false,
	},
	deviceType: {
		type: String,
		required: false,
	},
	os: {
		type: String,
		required: false,
	},
	language: {
		type: String,
		required: false,
	},
	manufacturer: {
		type: String,
		required: false,
	},
	region: {
		type: String,
		required: false,
	},
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);
