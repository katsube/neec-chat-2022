const crypto = require('crypto');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const bot = require('./bot');

//-----------------------------------------------
// グローバル変数
//-----------------------------------------------
const CHATLOG = [ ];     // チャットログ
const MAX_CHATLOG = 10;  // チャットログの最大数

//-----------------------------------------------
// ルーティング（express）
//-----------------------------------------------
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//----------------------------------------------
// Socket.IO
//-----------------------------------------------
io.on('connection', (socket) => {
  console.log('新しいユーザーが接続しました');

  // 入室時の処理
  const token = createToken();
  io.to(socket.id).emit('token', token);      // トークン送信
  io.to(socket.id).emit('chatlog', CHATLOG);  // ログ送信

  // チャットメッセージを受信したときの処理
  socket.on("post", (data) => {
    console.log(data);

    // ::str::を絵文字に変換
    const message = data.message.replaceAll(':smile:', '😁');
    data.message = message;

    io.emit("member-post", data);
    addChatLog(data);
  });
});

//--------------------
// botの自動発言
//--------------------
setInterval(() => {
  // 30%の確率で発動
  if( (Math.random() % 3) === 0  ){
    return;
  }
  const serif = bot.getRandomMessage();
  io.emit("member-post", serif);
  addChatLog(serif);
}, 1000 * 10);    // 10秒に1回


http.listen(3000);

/**
 * トークンを生成する
 *
 */
function createToken(){
  const uuid = crypto.randomUUID();       // 例： 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
  const token = uuid.replaceAll('-','');  // 例： 1b9d6bcdbbfd4b2d9b5dab8dfbbd4bed
  return(token);
}

/**
 * チャットログに追加する
 *
 */
function addChatLog(data){
  // 追加
  CHATLOG.push(data);

  // 最大数を超えたら古いものから削除
  if(CHATLOG.length > MAX_CHATLOG){
    CHATLOG.shift();
  }
}