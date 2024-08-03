const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tenantSchema = new Schema({
	dba: {
		type: String,
		required: false,
	},
	country_name: {
		type: String,
		required: true,
	},
	country_iso_2: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 2,
	},
	country_iso_3: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 3,
	},
	flag: {
		type: String,
		required: true,
	},
	country_code: {
		type: String,
		required: true,
	},
	endpoint: {
		type: String,
		required: true,
	},
	country_currency: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tenant", tenantSchema);
