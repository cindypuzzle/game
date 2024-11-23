const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  const games = [
    {
      id: '2048',
      title: '2048',
      description: '经典的2048数字游戏'
    },
    {
      id: 'snake',
      title: '贪吃蛇',
      description: '经典的贪吃蛇游戏'
    },
    {
      id: 'guess-number',
      title: '猜数字',
      description: '猜一个1到100之间的数字'
    },
    {
      id: 'memory-game',
      title: '记忆翻牌',
      description: '考验记忆力的翻牌游戏'
    },
    {
      id: 'magic-rings',
      title: '数圆',
      description: '挑战性的数字圆环谜题'
    },
    {
      id: 'spiral-galaxy',
      title: '星系重逢',
      description: '有趣的星系重逢解谜游戏'
    }
  ];
  
  res.render('index', { 
    title: '游戏集合',
    games: games
  });
});

module.exports = router;
