const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: '小游戏集合' });
});

// 添加2048游戏的路由
router.get('/game/2048', (req, res) => {
  res.render('2048', { title: '2048游戏' });
});

module.exports = router;
