const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const partnerSchema = new Schema(
	{
		clientId: {
			type: String,
			required: true,
			unique: true, // Ensures clientId uniqueness in the database
			index: true, // Adds an index to speed up searches by clientId
		},
		clientSecret: {
			type: String,
			required: true,
		},
		redirectUri: {
			type: String,
			required: true,
		},
		contact_person_firstname: {
			type: String,
			required: true,
		},
		contact_person_lastname: {
			type: String,
			required: true,
		},
		contact_person_phone_number: {
			type: String,
			required: true,
		},
		company: {
			type: String,
			required: true,
			index: true, // Adds an index for faster company lookups
		},
		role_id: {
			type: Number,
			required: false,
		},
		streetname: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: false,
		},
		country: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		postcode: {
			type: String,
			required: true,
		},
		country_code: {
			type: String,
			required: true,
		},
		user_currency: {
			type: String,
			required: false,
		},
		total_funds: {
			type: Number,
			default: 0,
		},
		total_payout: {
			type: Number,
			default: 0,
		},
		total_available: {
			type: Number,
			default: 0,
		},
		active: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields automatically
	}
);

// Middleware to hash the clientSecret before saving
partnerSchema.pre("save", async function (next) {
	if (!this.isModified("clientSecret")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.clientSecret = await bcrypt.hash(this.clientSecret, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to validate clientSecret
partnerSchema.methods.isValidSecret = async function (submittedSecret) {
	return await bcrypt.compare(submittedSecret, this.clientSecret);
};

module.exports = mongoose.model("ApiUser", partnerSchema);
