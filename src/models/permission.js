const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const permissionSchema = new Schema({

	id: {
		type: Number,
		required: true,
	},
	name: {
		type: Object,
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Permission", permissionSchema);
