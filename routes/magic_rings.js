const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

router.get('/', checkUser, async (req, res) => {
    try {
        // 确保用户信息正确传递给视图
        res.render('magic_rings', { 
            title: '数圆',
            user: res.locals.user
        });
    } catch (error) {
        console.error('渲染数圆页面失败:', error);
        res.status(500).send('服务器错误');
    }
});

// 修改路由路径，移除 records 前缀
router.get('/average-time', requireAuth, async (req, res) => {
    try {
        const { game_name, level } = req.query;
        const userId = req.user?.id;

        console.log('请求参数:', { game_name, level, userId });

        if (!userId) {
            console.log('用户未登录');
            return res.json({ avg_time: null });
        }

        // 首先获取该用户该游戏的总游戏次数
        const { count, error: countError } = await supabase
            .from('game_records')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('game_name', game_name)
            .eq('level', level);

        if (countError) {
            console.error('获取游戏总次数失败:', countError);
            throw countError;
        }

        console.log('用户游戏总次数:', count);

        // 如果总游戏次数少于10次，返回null
        if (count < 10) {
            console.log('游戏次数不足10次，返回null');
            return res.json({ avg_time: null });
        }

        // 如果游戏次数达到10次或以上，获取最近10局的平均时间
        const { data, error } = await supabase
            .from('game_records')
            .select('time_spent')
            .eq('user_id', userId)
            .eq('game_name', game_name)
            .eq('level', level)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('获取最近10局记录失败:', error);
            throw error;
        }

        console.log('获取到的游戏记录:', data);

        // 计算平均用时
        const avgTime = data.reduce((sum, record) => sum + record.time_spent, 0) / data.length;
        console.log('计算得到的平均用时:', avgTime);

        res.json({ avg_time: avgTime });

    } catch (error) {
        console.error('获取平均用时失败:', error);
        res.status(500).json({ error: '获取平均用时失败' });
    }
});

module.exports = router;
