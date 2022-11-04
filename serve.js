const crypto = require('crypto');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//-----------------------------------------------
// ルーティング（express）
//-----------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//-----------------------------------------------
// Socket.IO
//-----------------------------------------------
io.on('connection', (socket) => {
  console.log(`新しいユーザー(${socket.id})が接続しました`);

  // 接続時にトークンを作成しクライアントに送信
  const token = createToken();
  io.to(socket.id).emit('token', token);    // 本人にだけ送信

  // 発言を受信したら全クライアントに送信
  socket.on('post', (data) => {
    io.emit('member-post', data); // 全クライアントに送信
    console.log(data);
  });
});

// サーバを起動する
http.listen(3000, () => {
  console.log('サーバを起動しました。localhost:3000');
});


/**
 * トークンを作成し返却
 *
 * @returns {string}
 */
function createToken() {
  const uuid = crypto.randomUUID();              // 例:1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
  const token = 'TK' + uuid.replaceAll('-', ''); // 例:TK1b9d6bcdbbfd4b2d9b5dab8dfbbd4bed
  return(token);
}