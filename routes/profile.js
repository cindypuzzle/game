const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    const games = [
        {
            id: '2048',
            title: '2048'
        },
        {
            id: 'snake',
            title: '贪吃蛇'
        },
        {
            id: 'guess-number',
            title: '猜数字'
        },
        {
            id: 'memory-game',
            title: '记忆翻牌'
        },
        {
            id: 'magic-rings',
            title: '数圆'
        },
        {
            id: 'spiral-galaxy',
            title: '星系重逢'
        },
        {
            id: 'sliding-puzzle',
            title: '一举两得'
        }
    ];

    res.render('profile', {
        user: req.user,
        games: games
    });
});

module.exports = router; 