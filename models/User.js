const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: String,
  rooms: [
    {
      ref: "Room",
      type: mongoose.Types.ObjectId,
    },
  ],
  notify: Boolean,
});

// update user data
UserSchema.statics.update = function (req, res) {
  try {
    const { username, email, image, rooms, notify } = req.body;
    mongoose
      .model("User")
      .findById(req.params.id)
      .then((user) => {
        if (!!username) user.username = username;
        if (!!email) user.email = email;
        if (!!image) user.image = image;
        if (!!rooms) user.rooms = rooms;
        if (!!notify) user.notify = notify;

        user.save().then((savedUser) => res.send(savedUser));
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

// create a user
UserSchema.statics.create = function (req, res) {
  try {
    const { username, email, image, rooms, notify } = req.body;
    if (!username || !email)
      // both a username and an email are required
      throw new Error(`
                username and email required to create an erghy user.\n\n
                username provided: ${username}\n
                email provided: ${email}
            `);

    const user = new mongoose.model("User")({
      username,
      email,
      image,
      rooms: rooms || [],
      notify: notify || false,
    });

    user.save().then((savedUser) => res.send(savedUser));
  } catch (e) {
    res.status(400).send(e);
  }
};

// remove a user from the database
UserSchema.statics.delete = function (req, res) {
  try {
    mongoose
      .model("User")
      .findByIdAndDelete(req.params.id)
      .then((deletedUser) => {
        res.send(deletedUser);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

// get a user by ID
UserSchema.statics.getById = function (req, res) {
  try {
    mongoose
      .model("User")
      .findById(req.params.id)
      .then((user) => {
        res.send(user);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

// get a user by username
UserSchema.statics.getByUsername = function (req, res) {
  try {
    if (req.body.populate)
      mongoose
        .model("User")
        .findOne({ username: req.params.username })
        .then((user) => {
          if(!user) res.send({ message: "not found"})
          user
            .populate({
              path: "rooms",
              populate: [
                "last10messages",
                { path: "participants", populate: "user" },
              ],
            })
            .then((populatedUser) => res.send(populatedUser));
        });
    else
      mongoose
        .model("User")
        .findOne({ username: req.params.username })
        .then((user) => {
          res.send(user);
        });
  } catch (e) {
    res.send(e);
  }
};

// get all users
UserSchema.statics.getAll = function (req, res) {
  try {
    mongoose
      .model("User")
      .find()
      .then((users) => {
        res.send(users);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = mongoose.model("User", UserSchema);
