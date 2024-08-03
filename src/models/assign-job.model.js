const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const assignJobSchema = new Schema({
    job: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Dustbin',
        unique: true
    }],
    team: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Team'
    }],
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

assignJobSchema.plugin(uniqueValidator);
module.exports = mongoose.model("AssignJob", assignJobSchema);
