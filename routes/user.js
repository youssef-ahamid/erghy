const express = require("express");
const router = express.Router();
const User = require("../models/User");

router
  .get("/", User.getAll)
  .get("/:id", User.getById)
  .get("/u/:username", User.getByUsername)
  .post("/", User.create)
  .put("/:id", User.update)
  .delete("/:id", User.delete)

module.exports = router