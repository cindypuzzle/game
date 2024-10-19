const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('memory_game', { title: '记忆翻牌' });
});

module.exports = router;
