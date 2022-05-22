const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

router.get("/", async (req, res) => {
  try {
    const rooms = await Rooms.find();
    res.send(rooms);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    // socket listen
    res.send(room);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, image, participants } = req.body;

    if (!title)
      throw new Error(`
            title required to create an erghy room.\n\n
            title provided: ${title}\n
        `);

    const room = new Room({
      title,
      description,
      image,
      participants: participants || [],
    });
    const savedRoom = await room.save();
    res.send(savedRoom);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, image, participants } = req.body;
    const room = await Room.findById(req.params.id);

    if (!!title) room.title = title;
    if (!!description) room.description = description;
    if (!!image) room.image = image;
    if (!!participants && participants.length > 0)
      room.participants = participants;

    await room.save();
    res.send(room);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    res.send(room);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router