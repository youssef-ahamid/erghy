const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = Schema({
  sender: {
    ref: "User",
    type: mongoose.Types.ObjectId,
    required: true,
  },
  readBy: [
    {
      ref: "User",
      type: mongoose.Types.ObjectId,
    },
  ],
  deliveredTo: [
    {
      ref: "User",
      type: mongoose.Types.ObjectId,
    },
  ],
  text: String,
  data: Object,
  room: {
    ref: "Room",
    type: mongoose.Types.ObjectId,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now(),
  },
  editedAt: Date,
});

MessageSchema.statics.getAll = function (req, res) {
  try {
    mongoose
      .model("Message")
      .find()
      .then((messages) => res.send(messages));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e });
  }
};

MessageSchema.statics.get = function (req, res) {
  try {
    mongoose
      .model("Message")
      .findById(req.params.id)
      .then((message) => res.send(message));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e });
  }
};

MessageSchema.statics.create = function (req, res) {
  try {
    const { room, text, data, sender } = req.body;

    if (!sender || !room)
      throw new Error(`
              room & sender required to send an erghy message.\n\n
              sender provided: ${sender}\n
              room provided: ${room}\n
          `);

    if (!text && !data) throw new Error(`message cant be empty!`);

    const message = new mongoose.model("Message")({
      sender,
      readBy: [sender],
      deliveredTo: [sender],
      room,
      text,
      data,
    });

    message.save().then((savedMessage) => {
      mongoose
        .model("Room")
        .findById(room)
        .then((sentIn) => {
          if (!sentIn) throw new Error(`Room not found!`);

          if (
            !sentIn.public &&
            !sentIn.participants
              .map((p) => mongoose.Types.ObjectId(p.user).toString())
              .includes(sender)
          )
            throw new Error(`
            Not authorized! Sender not a member of private room.
            Room must be public or user must be part of room for this message to go through.`);

          // add message to room
          sentIn.messages.unshift(savedMessage._id);
          sentIn.last10messages.unshift(savedMessage._id);
          sentIn.last10messages.length = Math.min(
            sentIn.last10messages.length,
            10
          );

          sentIn.save().then((ƒ) => {
            res.send({ message: savedMessage, room });
          });
        });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e });
  }
};

MessageSchema.statics.update = function (req, res) {
  try {
    const { text, data, readBy, deliveredTo } = req.body;
    mongoose
      .model("Message")
      .findById(req.params.id)
      .then((message) => {
        if (!!text) message.text = text;
        if (!!data) message.data = data;
        if (!!readBy) message.readBy = readBy;
        if (!!deliveredTo) message.deliveredTo = deliveredTo;

        message.save().then((savedMessage) => res.send(savedMessage));
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e });
  }
};

MessageSchema.statics.delete = function (req, res) {
  try {
    mongoose
      .model("Message")
      .findById(req.params.id)
      .then((message) => {
        mongoose
          .model("Room")
          .findById(message.room)
          .then((sentIn) => {
            if (!sentIn) throw new Error(`Message does not belong to a room!`);
            // remove message from room
            sentIn.messages = sentIn.messages.filter(
              (msg) => msg != mongoose.Types.ObjectId(message._id).toString()
            );
            sentIn.last10messages = sentIn.messages.slice(0, 10);
            sentIn.save().then((room) => {
              message.remove().then((deletedMessage) => {
                res.send({ room, deletedMessage });
              });
            });
          });
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e });
  }
};

module.exports = mongoose.model("Message", MessageSchema);
