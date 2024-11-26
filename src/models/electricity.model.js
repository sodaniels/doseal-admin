
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const electricitySchema = new Schema({
    phoneNumber: { type: String, required: true },
    meterId: { type: String, required: true },
    meterName: { type: Object, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Electricity", electricitySchema);
