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

const MEMBERS = [
  // {id:1, token:'xxx', socketid:'yyy', name:'あるぱか'},
];
let MEMBERS_COUNT = 1;

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

  //---------------------------
  // 接続時
  //---------------------------
  const token = createToken();
  io.to(socket.id).emit('token', token);

  MEMBERS.push({
    id:       MEMBERS_COUNT,
    token:    token,
    socketid: socket.id,
    name:     null
  });
  MEMBERS_COUNT++;

  //---------------------------
  // 入室
  //---------------------------
  socket.on("join", (data) => {
    console.log("join", data);
    const user = findMember(data.token);

    // トークンで本人確認
    if( user === null || socket.id !== user.socketid ){
      console.log('不正なトークンです');
      io.to(socket.id).emit('join-result', {status:false, message:'不正なトークンです'});
      return;
    }

    // 名前を保存
    user.name = data.name;

    // 入室結果を送信
    io.to(socket.id).emit('join-result', {
      status:  true,
      id:      user.id,
      chatlog: CHATLOG,
      members: createMemberList()
    });

    // 本人以外に入室を通知
    socket.broadcast.emit('member-join', {token:user.id, name:user.name});
  });

  //---------------------------
  // 発言
  //---------------------------
  socket.on("post", (data) => {
    console.log(data);
    const user = findMember(data.token);

    // トークンで本人確認
    if( user === null || socket.id !== user.socketid ){
      console.log('不正なトークンです');
      return(false);
    }

    let message = data.message;
    message = convertEmoji(message);
    message = convertTime(message);
    message = convertNGWord(message);
    data.message = message;

    // 発言を全員に送信
    io.emit("member-post", {token:user.id, message:message});

    // チャットログに追加
    addChatLog({token:user.id, message:message});
  });

  //---------------------------
  // 退室
  //---------------------------
  socket.on("quit", (data) => {
    console.log("quit", data);
    const user = findMember(data.token);

    // トークンで本人確認
    if( user === null || socket.id !== user.socketid ){
      console.log('不正なトークンです');
      io.to(socket.id).emit('quit-result', {status:false, message:'不正なトークンです'});
      return(false);
    }

    // 管理用の配列から削除
    removeMember(user.token);

    // 本人に退室を通知
    io.to(socket.id).emit('quit-result', {status:true});

    // 本人以外に退室を通知
    socket.broadcast.emit('member-quit', {token:user.id});

    // 退室
    socket.disconnect();
  });
});

/*
setInterval(() => {
  const data = bot.getRandomMessage();
  data.tokne = 1;
  io.emit("member-post", data);
}, 5000);
*/

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

function findMember(token){
  for(let i=0; i<MEMBERS.length; i++){
    if(MEMBERS[i].token === token){
      return(MEMBERS[i]);
    }
  }
  return(null);
}

function createMemberList(){
  let list = [ ];
  for(let i=0; i<MEMBERS.length; i++){
    if(MEMBERS[i].name !== null){
      list.push({
        token: MEMBERS[i].id,
        name:  MEMBERS[i].name
      });
    }
  }
  return(list);
}

function removeMember(token){
  for(let i=0; i<MEMBERS.length; i++){
    if(MEMBERS[i].token === token){
      MEMBERS.splice(i, 1);
      return(true);
    }
  }
  return(false);
}