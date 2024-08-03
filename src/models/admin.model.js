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
	role: {
		type: String,
		required: true,
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
	permissions: {
		type: Object,
		required: false,
	},
	createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
	password: {
		type: String,
		required: false,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});


adminSchema.virtual('name').get(function() {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

module.exports = mongoose.model("Admin", adminSchema);
