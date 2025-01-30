const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { checkUser } = require('../middleware/authMiddleware');

// 添加检查游戏是否可用的中间件
const checkGameAvailable = (req, res, next) => {
    const gameId = req.path.split('/')[1]; // 获取URL中的游戏ID
    const games = [
        { id: 'magic-rings', disabled: false },
        { id: '2048', disabled: true },
        { id: 'guess-number', disabled: true },
        { id: 'memory-game', disabled: true },
        { id: 'spiral-galaxy', disabled: true },
        { id: 'sliding-puzzle', disabled: true }
    ];
    
    const game = games.find(g => g.id === gameId);
    if (game && game.disabled) {
        return res.redirect('/?error=游戏暂未开放，敬请期待！');
    }
    next();
};

// 主页路由
router.get('/', checkUser, async (req, res) => {
    try {
        const games = [
            { id: 'magic-rings', title: '数圆', description: '寻找四个首尾相连且数字之和相等的圆环', disabled: false },
            { id: '2048', title: '2048', description: '经典的2048数字游戏', disabled: true },
            { id: 'guess-number', title: '猜数字', description: '猜一个1到100之间的数字', disabled: true },
            { id: 'memory-game', title: '记忆游戏', description: '考验记忆力的翻牌游戏', disabled: true },
            { id: 'spiral-galaxy', title: '星系重逢', description: '帮助两个星系找到彼此', disabled: true },
            { id: 'sliding-puzzle', title: '滑块拼图', description: '经典的滑块拼图游戏', disabled: true }
        ];

        res.render('index', { 
            title: 'Mind Record',
            games: games,
            user: res.locals.user,
            error: req.query.error
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.render('index', { 
            title: 'Mind Record',
            games: games,
            user: null,
            error: req.query.error
        });
    }
});

// 拦截所有被禁用的游戏路由
router.use('/:gameId', checkGameAvailable);

module.exports = router;
