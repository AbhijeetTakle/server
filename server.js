const express = require("express");
const http = require("http");
const { router } = require("./routes");
require("dotenv").config();
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const { Socket } = require("socket.io");

const app = express();
const server = http.createServer(app);

PORT = process.env.PORT || 5000;

app.use(cors());
app.use("/", router);

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("we have new Connection");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    socket.join(user.room);
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("user left");
  });
});

server.listen(PORT, () => {
  console.log(`server listening on port: ${PORT}`);
});
