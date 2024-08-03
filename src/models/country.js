const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const countrySchema = new Schema({
	id: {
		type: Number,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	iso_3166_2: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 2,
	},
	iso_3166_3: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 3,
	},
	currencies: {
		type: Array,
		required: false,
	},
	capital: {
		type: String,
		required: true,
	},
	flag: {
		type: String,
		required: true,
	},
	region: {
		type: String,
		required: false,
	},
	mnos: {
		type: Array,
		required: false,
	},
	can_be_remit_to: {
		type: Number,
		required: false,
	},

	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Country", countrySchema);
