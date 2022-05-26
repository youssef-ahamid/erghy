const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
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
mongoose.connect(
  process.env.MONGODB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("mongoDB connected");
  }
);

const userRouter = require("./routes/user.js");
app.use("/user/", userRouter);

const messageRouter = require("./routes/message.js");
app.use("/message/", messageRouter);

const roomRouter = require("./routes/room.js");
const User = require("./models/User.js");
app.use("/room/", roomRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Erghy live on port ${PORT}`);
});

const SOCKETPORT = process.env.SOCKETPORT || 8080;
const io = require("socket.io")(SOCKETPORT, {
  cors: {
    origin: "*",
  },
});

console.log("Socket on... Awaiting live connections");

const UserModel = require("./models/User.js");
const MessageModel = require("./models/Message.js");
const RoomModel = require("./models/Room.js");
const ObjectId = mongoose.Types.ObjectId;
io.on("connection", (socket) => {
  let currentUser;
  console.log(`
    user connected!
    online users: ${io.engine.clientsCount}
  `);

  socket.on("create-room", async (room, cb) => {
    if (!currentUser) {
      socket.emit("no-user", room);
      return cb("You must be logged in to create a room");
    }
    room.participants.push(ObjectId(currentUser._id).toString());
    if (!!room.invite)
      await UserModel.getByUsername(
        {
          body: {},
          params: { username: room.invite },
        },
        {
          send: async (user) => {
            room.participants.push(ObjectId(user._id).toString());
            await RoomModel.create(
              {
                body: room,
              },
              {
                send: (room) => {
                  cb(room);
                },
              }
            );
          },
        }
      );
    else
      await RoomModel.create(
        {
          body: room,
        },
        {
          send: (room) => {
            cb(room);
          },
        }
      );
  });

  socket.on("add-to-room", async (username, room, cb) => {
    console.log(room);
    await UserModel.getByUsername(
      {
        params: { username },
      },
      {
        send: async (user) => {
          let participants = [...room.participants, user._id];
          await RoomModel.update(
            {
              params: { id: room._id },
              body: { participants },
            },
            {
              send: (room) => {
                cb(room);
              },
            }
          );
        },
      }
    );
  });

  socket.on("get-user-chats", async (identifier, cb) => {
    await UserModel.getByUsername(
      {
        params: { username: identifier },
        body: { populate: true },
      },
      {
        send: (user) => {
          if (!user._id) return cb({ message: "not found", status: 400 });
          user.rooms.map((room) => {
            socket.join(ObjectId(room._id).toString());
            socket
              .to(ObjectId(room._id).toString())
              .emit("joined-room", { room });
          });
          currentUser = user;
          cb(user);
        },
      }
    );
  });

  socket.on("send-message", async (msg, room) => {
    if (!currentUser) {
      socket.emit("no-user", msg, room);
      return;
    }
    socket
      .to(ObjectId(room).toString())
      .emit("receive-message", { text: msg, sender: currentUser._id });
    await MessageModel.create(
      {
        body: { text: msg, room, sender: ObjectId(currentUser._id).toString() },
      },
      {
        send: () => {},
      }
    );
  });
});
