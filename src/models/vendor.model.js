
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: Object, required: true },
    service: { type: Object, required: true },
    note: { type: Object, required: false },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Blocked"],
        default: "Active",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vendor", vendorSchema);
