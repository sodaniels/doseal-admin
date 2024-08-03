const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pageSchema = new Schema({
	
	title: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: false,
	},
	createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Page", pageSchema);
