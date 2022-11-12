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

    // 特定のキーワードを変換
    let message = convertEmoji(data.message);   // :str:を絵文字に変換
    message = convertTime(message);             // $date/$timeを日付/時間に変換
    data.message = message;

    io.emit("member-post", data);
    addChatLog(data);
  });
});

//--------------------
// botの自動発言
//--------------------
setInterval(() => {
  console.log('setInterval()');

  // 50%の確率で発動
  if( (Math.random() % 2) === 0  ){
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

/**
 * 絵文字変換
 */
function convertEmoji(str){
  return str
          .replaceAll(':smile:', '😁')
          .replaceAll(':susi:', '🍣')
          .replaceAll(':cat:', '😺');
}

// 絵文字変換 別パターンの実装例
function convertEmoji2(str){
  const EMOJI = {smile: '😁', susi: '🍣', cat: '😺'};
  return str.replace(/:([a-zA-Z0-9]{1,}):/g, (match, p1) => {
    return EMOJI[p1];
  });
}

/**
 * 時間変換
 */
function convertTime(str){
  const now = new Date();
  return str
          .replaceAll('$date', now.toLocaleDateString('sv'))    // YYYY-MM-DD
          .replaceAll('$time', now.toLocaleTimeString('sv'));   // HH:MM:SS
}

/**
 * NGワードを変換する（課題）
 */
function convertNGWord(str){
  const NG_WORD = '';
  return str;
}