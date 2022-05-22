const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.get("/u/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.send(user);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, email, image, rooms, notify } = req.body;

    if (!username || !email)
      throw new Error(`
            username and email required to create an erghy user.\n\n
            username provided: ${username}\n
            email provided: ${email}
        `);

    const user = new User({
      username,
      email,
      image,
      rooms: rooms || [],
      notify: notify || false,
    });
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { username, email, image, rooms, notify } = req.body;
    const user = await User.findById(req.params.id);

    if (!!username) user.username = username;
    if (!!email) user.email = email;
    if (!!image) user.image = image;
    if (!!rooms) user.rooms = rooms;
    if (!!notify) user.notify = notify;

    await user.save();
    res.send(user);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.send(user);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router