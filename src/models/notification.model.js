const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	title: { type: String, required: false },
	message: { type: String, required: true },
	sendToAll: { type: Boolean, required: false },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Admin",
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
