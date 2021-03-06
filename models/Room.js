const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = Schema({
  participants: [
    {
      user: {
        ref: "User",
        type: mongoose.Types.ObjectId,
      },
      joinedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  messages: [
    {
      ref: "Message",
      type: mongoose.Types.ObjectId,
    },
  ],
  last10messages: [
    {
      ref: "Message",
      type: mongoose.Types.ObjectId,
    },
  ],
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  public: {
    type: Boolean,
    default: false,
  },
});

RoomSchema.statics.getAll = function (req, res) {
  try {
    mongoose
      .model("Room")
      .find()
      .then((rooms) => res.send(rooms));
  } catch (e) {
    console.error(e);
    res.send(e);
  }
};
RoomSchema.statics.get = function (req, res) {
  try {
    Room.findById(req.params.id).then((room) => {
      if (!room) throw new Error("room not found");
      res.send(room);
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};
RoomSchema.statics.create = async function (req, res) {
  try {
    const { title, description, image, participants } = req.body;

    if (!title)
      throw new Error(`
                title required to create an erghy room.\n\n
                title provided: ${title}\n
            `);

    const room = new mongoose.model("Room")({
      title,
      description,
      image,
      participants: participants.map((p) => {
        return { user: mongoose.Types.ObjectId(p) };
      }),
    });

    let usersSaved = 0;

    await room.save().then((savedRoom) => {
      savedRoom.participants.forEach((p) => {
        mongoose
          .model("User")
          .findById(p.user)
          .then(async (user) => {
            user.rooms.push(room);
            await user.save().then(() => {
              usersSaved++;
              if (usersSaved == savedRoom.participants.length)
                res.send(savedRoom);
            });
          });
      });
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};
RoomSchema.statics.update = function (req, res) {
  try {
    const { title, description, image, participants } = req.body;
    mongoose
      .model("Room")
      .findById(req.params.id)
      .then((room) => {
        if (!!title) room.title = title;
        if (!!description) room.description = description;
        if (!!image) room.image = image;
        if (!!participants && participants.length > 0)
          room.participants = participants.map((p) => {
            return { user: mongoose.Types.ObjectId(p) };
          });

        room.save().then((room) => res.send(room));
      });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};
RoomSchema.statics.delete = function (req, res) {
  try {
    mongoose
      .model("Room")
      .findByIdAndDelete(req.params.id)
      .then((deletedRoom) => res.send(deletedRoom));
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};

module.exports = mongoose.model("Room", RoomSchema);
