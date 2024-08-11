const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
	createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
	phoneNumber: {
		type: String,
		required: false,
	},
	meterName: {
		type: String,
		required: false,
	},
	meterId: {
		type: String,
		required: false,
	},

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meter', deviceSchema);
