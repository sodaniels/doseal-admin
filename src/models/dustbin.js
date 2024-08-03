
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dustbinSchema = new Schema({
    id: { type: String, required: false },
    barcode: { type: String, required: false },
    location: { type: Object, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    landmark: { type: String, required: true },
    status: { type: String, required: false, default: ['ASSIGNED', 'PICKED'] },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    pickedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: false
    },
    updatedBy: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Dustbin", dustbinSchema);
