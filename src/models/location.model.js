const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const locationSchema = new Schema({
	lat: {
		type: String,
		required: true,
	},
	lng: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: false,
	},
	addedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Admin'
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Location", locationSchema);
