
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsRoomSchema = new Schema({
    image: { type: String, required: false },
    title: { type: String, required: false },
    excerpt: { type: Object, required: true },
    content: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NewsRoom", newsRoomSchema);
