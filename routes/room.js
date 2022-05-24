const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

router
  .get("/", Room.getAll)
  .get("/:id", Room.get)
  .post("/", Room.create)
  .put("/:id", Room.update)
  .delete("/:id", Room.delete);

module.exports = router