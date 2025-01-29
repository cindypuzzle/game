const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/', (req, res) => {
    res.render('magic_rings', { title: '神奇四环' });
});

// 修改路由路径，移除 records 前缀
router.get('/average-time', async (req, res) => {
    try {
        const { game_name, level } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.json({ avg_time: null });
        }

        // 获取最近10局游戏记录
        const { data, error } = await supabase
            .from('game_records')
            .select('time_spent')
            .eq('user_id', userId)
            .eq('game_name', game_name)
            .eq('level', level)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            throw error;
        }

        // 如果记录少于10条，返回null
        if (!data || data.length < 10) {
            return res.json({ avg_time: null });
        }

        // 计算平均用时
        const avgTime = data.reduce((sum, record) => sum + record.time_spent, 0) / data.length;

        res.json({ avg_time: avgTime });
    } catch (error) {
        console.error('获取平均用时失败:', error);
        res.status(500).json({ error: '获取平均用时失败' });
    }
});

module.exports = router;
