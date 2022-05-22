const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const path = require("path");
app.use(express.static(path.join(__dirname, 'public')));
// Set EJS as templating engine
app.set("view engine", "ejs");

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

const logger = require("morgan");
app.use(logger("dev"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('mongoDB connected')
    });

const userRouter = require("./routes/user.js");
app.use("/user/", userRouter);

const messageRouter = require("./routes/message.js");
app.use("/message/", messageRouter);

const roomRouter = require("./routes/room.js");
app.use("/room/", roomRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Erghy live on port ${PORT}`);
});
