const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find();
    res.send(messages);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    res.send(message);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.post("/", async (req, res) => {
  try {
    const { room, text, data, sender } = req.body;

    if (!sender || !room)
      throw new Error(`
            room & sender required to send an erghy message.\n\n
            sender provided: ${sender}\n
            room provided: ${room}\n
        `);

    const message = new Message({
      sender,
      room,
      text,
      data,
    });
    const savedMessage = await message.save();

    // TODO: add message to room

    res.send(savedMessage);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { text, data, readBy, deliveredTo } = req.body;
    const message = await Message.findById(req.params.id);

    if (!!text) message.text = text;
    if (!!data) message.data = data;
    if (!!readBy) message.readBy = readBy;
    if (!!deliveredTo) message.deliveredTo = deliveredTo;

    await message.save();
    res.send(message);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    // TODO: remove message from room
                                        
    res.send(message);
  } catch (e) {
    res.status(500).json({ message: e });
  }
});

module.exports = router