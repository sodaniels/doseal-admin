const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const districtsSchema = new Schema({
    id: { type: String, required: false },
    code: { type: String, required: true },
    region: { type: String, required: true },
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




districtsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("District", districtsSchema);
