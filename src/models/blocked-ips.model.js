const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const blockedIpsSchema = new Schema({
    ip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

blockedIpsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("BlockedIps", blockedIpsSchema);
