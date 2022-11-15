const serif = [
  {"name":"bot", "message":"おはよう"},
  {"name":"bot", "message":"最近どう？"},
  {"name":"bot", "message":"寿司は美味しいよね"},
  {"name":"bot", "message":"猫かと思ったらコンビニの袋だったよ…"},
  {"name":"bot", "message":"(つ∀-)ｵﾔｽﾐｰ"},
  {"name":"bot", "message":"神ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!"},
  {"name":"bot", "message":"健康のためなら死ねる(๑•̀ㅂ•́)و✧"},
  {"name":"bot", "message":"(´・ω・｀)ｼｮﾎﾞｰﾝ"},
  {"name":"bot", "message":"布団は友達"},
  {"name":"bot", "message":"オレのこの手が真赤に燃える！"},
];

/**
 * ランダムにセリフを返す
 */
function getRandomMessage(key=null){
  const num = (key === null)? Math.floor(Math.random() * serif.length) : key;
  return(serif[num]);
}

//-----------------------------------------------
// exports
//-----------------------------------------------
module.exports = {
  getRandomMessage
};