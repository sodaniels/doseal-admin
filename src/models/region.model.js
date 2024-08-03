const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const regionSchema = new Schema({
    id: { type: String, required: false },
    code: { type: String, required: true },
    name: { type: String, required: true, unique: true, trim: true, },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


regionSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Region", regionSchema);
