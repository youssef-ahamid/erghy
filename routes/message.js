const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router
  .get("/", Message.getAll)
  .get("/:id", Message.get)
  .post("/", Message.create)
  .put("/:id", Message.update)
  .delete("/:id", Message.delete);

module.exports = router;
