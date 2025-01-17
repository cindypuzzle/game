const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// 创建游戏记录
router.post('/', auth, async (req, res) => {
  try {
    const { game_name, score, time_spent, level } = req.body;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('game_records')
      .insert([
        { 
          user_id,
          game_name,
          score,
          time_spent,
          level
        }
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取用户的游戏记录
router.get('/user', auth, async (req, res) => {
  try {
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