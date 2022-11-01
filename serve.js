const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket) => {
  socket.on("post", (data) => {
    console.log(data);
    io.emit("member-post", data);
  });
});

http.listen(3000);