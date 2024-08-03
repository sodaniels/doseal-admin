const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    id: { type: String, required: false },
    vehicleId: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    carType: { type: String, required: true },
    status: { type: String, required: true },
    year: { type: String, required: true, trim: true },
    make: { type: String, required: true },
    model: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, unique: true },
    fuelType: { type: String, required: false },
    ownership: { type: String, required: false },
    assignedStatus: {
        type: String,
        enum: ["Assigned", "Unassigned", "Archived"],
        default: "Unassigned",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

vehicleSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Vehicle", vehicleSchema);
