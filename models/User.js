const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: String,
    rooms: [{
        ref: "Room",
        type: mongoose.Types.ObjectId
    }],
    notify: Boolean
});

module.exports = mongoose.model("User", UserSchema)
