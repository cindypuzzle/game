const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { checkUser } = require('../middleware/authMiddleware');

router.get('/', checkUser, async (req, res) => {
    try {
        const games = [
            { id: '2048', title: '2048', description: '经典的2048数字游戏' },
            { id: 'snake', title: '贪吃蛇', description: '经典的贪吃蛇游戏' },
            { id: 'guess-number', title: '猜数字', description: '猜一个1到100之间的数字' },
            { id: 'memory-game', title: '记忆游戏', description: '考验记忆力的翻牌游戏' },
            { id: 'magic-rings', title: '魔法圈', description: '用魔法圈创造美丽的图案' },
            { id: 'spiral-galaxy', title: '星系重逢', description: '帮助两个星系找到彼此' },
            { id: 'sliding-puzzle', title: '滑块拼图', description: '经典的滑块拼图游戏' }
        ];

        res.render('index', { 
            title: 'Mind Record',
            games: games,
            user: res.locals.user
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.render('index', { 
            title: 'Mind Record',
            games: games,
            user: null
        });
    }
});

module.exports = router;
