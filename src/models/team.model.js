const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const temaSchema = new Schema({
    name: { type: String, required: true, trim: true },
    startDate: { type: String, required: false },
    startTime: { type: String, required: false },
    endDate: { type: String, required: false },
    endTime: { type: String, required: false },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
    collectors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

temaSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Team", temaSchema);
