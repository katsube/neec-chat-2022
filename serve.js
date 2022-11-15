const crypto = require('crypto');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const bot = require('./bot.js');

//-----------------------------------------------
// グローバル変数
//-----------------------------------------------
const CHATLOG = [ ];      // チャットログ
const MAX_CHATLOG = 10;   // チャットログの最大数

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

  const token = createToken();
  io.to(socket.id).emit('token', token);
  io.to(socket.id).emit('chatlog', CHATLOG);

  socket.on("post", (data) => {
    console.log(data);
    let message = data.message;
    message = convertEmoji(message);
    message = convertTime(message);
    message = convertNGWord(message);
    data.message = message;
    io.emit("member-post", data);
    addChatLog(data);
  });
});

setInterval(() => {
  const data = bot.getRandomMessage();
  data.tokne = 1;
  io.emit("member-post", data);
}, 5000);


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

function addChatLog(data){
  CHATLOG.push(data);

  if(CHATLOG.length > MAX_CHATLOG){
    CHATLOG.shift();
  }
}

function convertEmoji(str){
  return str
          .replaceAll(':smile:', '😄')
          .replaceAll(':sushi:', '🍣')
          .replaceAll(':beer:',  '🍺')
          .replaceAll(':cat:',   '🐈');
}

function convertEmoji2(str){
  const emoji = {smile:'😄', sushi:'🍣', beer:'🍺', cat:'🐈'};
  return str.replace(/:([a-zA-Z0-9]{1,}):/g, (match, p1)=>{
    return emoji[p1];
  })
}

function convertTime(str){
  const now = new Date();
  return str
          .replaceAll('$date', now.toLocaleDateString())
          .replaceAll('$time', now.toLocaleTimeString());
}

// 課題 2022-11-14
function convertNGWord(str){
  const ngword = 'ステーキ'; // ???
  return(str);
}