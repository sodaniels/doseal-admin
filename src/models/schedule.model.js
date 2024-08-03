const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    title: { type: String, required: true, trim: true },
    startDate: { type: String, required: false },
    frequency: { type: String, required: false },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    description: { type: String, required: true, trim: true },
    location: Array,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

scheduleSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Schedule", scheduleSchema);
