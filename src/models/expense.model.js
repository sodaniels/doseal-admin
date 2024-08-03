
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    title: { type: String, required: false },
    amount: { type: Object, required: true },
    note: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, required: false },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);
