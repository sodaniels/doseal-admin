const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema({
	userId: {
		type: String,
		required: false,
	},
	adminId: {
		type: String,
		required: false,
	},
	firstName: {
		type: String,
		trim: true,
		required: true,
	},
	middleName: {
		type: String,
		trim: true,
		required: false,
	},
	lastName: {
		type: String,
		trim: true,
		required: true,
	},

	phoneNumber: {
		type: String,
		required: false,
	},
	email: {
		type: String,
		required: true,
	},

	status: {
		type: String,
		enum: ["Active", "Inactive", "Blocked"],
		default: "Active",
	},
	role: {
		type: String,
		enum: [
			"Super-Admin",
			"Admin",
			"Viewer",
			"Compliance",
			"Service-Delivery",
			"Marketing",
		],
		default: "Admin",
	},
	permissions: [
		{
			type: String,
			enum: [
				"Dashboard",
				"Transactions",
				"Users",
				"Downloads",
				"News Room",
				"Notifications",
				"Expenses",
				"Devices",
				"Help Desk",
			],
		},
	],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
	},
	password: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

adminSchema.virtual("name").get(function () {
	return `${
		this.firstName
	} ${this.middleName ? this.middleName + " " : ""}${this.lastName}`;
});

module.exports = mongoose.model("Admin", adminSchema);
