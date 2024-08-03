const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const completedJobSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Dustbin',
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    assignedStatus: {
        type: String,
        enum: ["Completed", "Assigned", "Unassigned", "Archived"],
        default: "Assigned",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CompletedJob", completedJobSchema);
