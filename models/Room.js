const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = Schema({
    participants: [{
        user: {
            ref: "User",
            type: mongoose.Types.ObjectId
        },
        joinedAt: { 
            type: Date,
            default: Date.now()
        }
    }],
    messages: [{
        ref: "Message",
        type: mongoose.Types.ObjectId
    }],
    last10messages: [{
        ref: "Message",
        type: mongoose.Types.ObjectId
    }],
    title: {
        type: String,
        required: true
    },
    description: String,
    image: String,
});

module.exports = mongoose.model("Room", RoomSchema)
