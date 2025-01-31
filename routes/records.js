const express = require('express');
const router = express.Router();
const { createSupabaseClient } = require('../config/supabase');
const auth = require('../middleware/auth');

// 创建游戏记录
router.post('/', auth, async (req, res) => {
    try {
        // 检查用户是否已登录
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { game_name, score, time_spent, level } = req.body;
        const user_id = req.user.id;
        const access_token = req.cookies['access_token'];

        if (!access_token) {
            return res.status(401).json({ error: '未找到有效的访问令牌' });
        }

        console.log('接收到的记录数据:', {
            user_id,
            game_name,
            score,
            time_spent,
            level
        });

        const supabase = createSupabaseClient(access_token);

        // 获取用户最近10条游戏记录的平均时间
        const { data: recentRecords, error: selectError } = await supabase
            .from('game_records')
            .select('time_spent')
            .eq('user_id', user_id)
            .eq('game_name', game_name)
            .eq('level', level)
            .order('created_at', { ascending: false })
            .limit(10);

        if (selectError) {
            console.error('获取记录失败:', selectError);
            return res.status(500).json({ error: '获取记录失败' });
        }

        // 计算平均时间（包括当前这一次）
        const allTimes = [time_spent, ...recentRecords.map(record => record.time_spent)];
        const avgTime = Math.floor(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);

        const { data, error } = await supabase
            .from('game_records')
            .insert([
                {
                    user_id,
                    game_name,
                    score,
                    time_spent,
                    level,
                    avg_time_last_10: avgTime
                }
            ])
            .select();

        if (error) {
            console.error('保存记录失败:', error);
            return res.status(500).json({ error: '保存记录失败' });
        }

        res.json({ 
            success: true, 
            record: data[0],
            avg_time_last_10: avgTime
        });
    } catch (error) {
        console.error('处理记录时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取用户的游戏记录
router.get('/user', auth, async (req, res) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取游戏排行榜
router.get('/leaderboard/:game_name', async (req, res) => {
  try {
    const { game_name } = req.params;
    
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('game_records')
      .select(`
        *,
        users:user_id (
          username
        )
      `)
      .eq('game_name', game_name)
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 