const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    id: { type: String, required: false },
    vehicle: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Vehicle',
        unique: true
    },
    supervisor: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Person'
    },
    startDate: { type: String, required: false },
    startTime: { type: String, required: false },
    endDate: { type: String, required: false },
    endTime: { type: String, required: false },
    note: { type: String, required: false, trim: true },
    assignedStatus: {
        type: String,
        enum: ["Assigned", "Unassigned", "Archived"],
        default: "Assigned",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

assignmentSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Assignment", assignmentSchema);
