const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const assembliesSchema = new Schema({
    id: { type: String, required: false },
    code: { type: String, required: true },
    district: { type: String, required: true },
    name: { type: String, required: true, unique: true, trim: true, },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
});


assembliesSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Assembly", assembliesSchema);
