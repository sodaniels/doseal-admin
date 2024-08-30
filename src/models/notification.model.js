const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	title: { type: String, required: false },
	excerpt: { type: String, required: true },
	message: { type: String, required: true },
	sendToAll: { type: Boolean, required: false },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
	},
	receivedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	status: {
		type: String,
		required: false,
		enum: ["READ", "NO_READ"],
		default: 'NO_READ',
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
