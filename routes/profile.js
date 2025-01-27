const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/authMiddleware');

// 游戏列表配置
const games = [
    { id: '2048', title: '2048' },
    { id: 'snake', title: '贪吃蛇' },
    { id: 'guess_number', title: '猜数字' },
    { id: 'memory_game', title: '记忆翻牌' },
    { id: 'magic_rings', title: '数圆' },
    { id: 'spiral_galaxy', title: '星系重逢' },
    { id: 'sliding_puzzle', title: '一举两得' }
];

// 个人资料页面路由
router.get('/', requireAuth, async (req, res) => {
    try {
        res.render('profile', { 
            title: '个人资料',
            user: req.user,
            games: games
        });
    } catch (error) {
        console.error('获取个人资料错误:', error);
        res.status(500).send('服务器错误');
    }
});

// 获取用户游戏记录的 API
router.get('/records', requireAuth, async (req, res) => {
    try {
        console.log('正在获取用户记录，用户ID:', req.user.id);
        
        const { data, error } = await supabase
            .from('game_records')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('获取记录错误:', error);
            throw error;
        }

        console.log('获取到的记录:', data);
        res.json(data);
    } catch (error) {
        console.error('获取记录失败:', error);
        res.status(500).json({ error: '获取记录失败' });
    }
});

// 获取特定游戏的记录
router.get('/records/:gameId', requireAuth, async (req, res) => {
    try {
        const gameId = req.params.gameId;
        console.log('正在获取游戏记录，游戏ID:', gameId, '用户ID:', req.user.id);
        
        const { data, error } = await supabase
            .from('game_records')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('game_name', gameId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('获取记录错误:', error);
            throw error;
        }

        console.log('获取到的记录:', data);
        res.json(data);
    } catch (error) {
        console.error('获取记录失败:', error);
        res.status(500).json({ error: '获取记录失败' });
    }
});

module.exports = router; 