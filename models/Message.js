const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = Schema({
    sender: {
        ref: "User",
        type: mongoose.Types.ObjectId,
        required: true
    },
    readBy: [{
        ref: "User",
        type: mongoose.Types.ObjectId
    }],
    deliveredTo: [{
        ref: "User",
        type: mongoose.Types.ObjectId
    }],
    text: String,
    data:  Object,
    room: {
        ref: "Room",
        type: mongoose.Types.ObjectId,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now()
    },
    editedAt: Date
});

module.exports = mongoose.model("Message", MessageSchema)
