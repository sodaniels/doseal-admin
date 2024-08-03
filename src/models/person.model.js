const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const personSchema = new Schema({
    userId: { type: String, required: false },
    category: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, required: false, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true },
    idType: { type: String, required: false },
    idNumber: { type: String, required: false, trim: true },
    idExpiryDate: { type: String, required: false, trim: true },
    region: { type: String, required: true },
    password: { type: String, required: false },
    isRouteAssigned: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Blocked"],
        default: "Inactive",
    },
    assignedStatus: {
        type: String,
        enum: ["Assigned", "Unassigned", "Archived"],
        default: "Unassigned",
    },
    isJobAssigned: {
        type: String,
        enum: ["Assigned", "Unassigned"],
        default: "Unassigned",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

personSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Person", personSchema);
