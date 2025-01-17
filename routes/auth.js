const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 渲染登录/注册页面
router.get('/', (req, res) => {
  res.render('auth');
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${process.env.SITE_URL}/auth/callback`,
        captchaToken: null
      }
    });

    if (authError) throw authError;

    res.json({ 
      message: '注册成功,请查收验证邮件',
      user: authData.user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 先获取用户信息
    const { data: { users }, error: userError } = await supabase
      .from('auth.users')
      .select('email_confirmed_at')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    // 检查邮箱是否已验证
    if (!users.email_confirmed_at) {
      return res.status(400).json({ 
        error: '请先验证邮箱后再登录',
        needVerification: true 
      });
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.cookie('sb-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({ message: '登录成功', user: session.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 登出
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    res.clearCookie('sb-token');
    res.json({ message: '已登出' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 修改回调路由
router.get('/callback', async (req, res) => {
  try {
    console.log('=== 验证回调调试信息 ===');
    console.log('Query 参数:', req.query);
    console.log('URL:', req.url);
    console.log('Hash:', req.hash);
    console.log('========================');

    // 从 URL 中获取 access_token 和 refresh_token
    const hashParams = new URLSearchParams(req.query.hash?.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken) {
      // 如果没有 token，尝试设置会话
      const { data, error } = await supabase.auth.setSession({
        access_token: req.query.access_token,
        refresh_token: req.query.refresh_token
      });

      if (error) {
        console.error('设置会话错误:', error);
        throw error;
      }

      if (!data.session) {
        throw new Error('无法创建会话');
      }

      // 设置 cookie
      res.cookie('sb-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    // 获取用户信息
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('获取用户信息错误:', userError);
      throw userError;
    }

    if (!user) {
      throw new Error('无法获取用户信息');
    }

    console.log('验证成功，用户信息:', user);

    res.render('auth-callback', {
      message: '邮箱验证成功！正在跳转...',
      redirect: '/'
    });
  } catch (error) {
    console.error('验证失败详情:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.render('auth-callback', {
      message: '验证失败：' + error.message,
      redirect: '/auth'
    });
  }
});

// 添加新的验证端点
router.post('/verify-email', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      throw new Error('验证令牌缺失');
    }

    // 使用 getUser 验证 token
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error) throw error;

    if (!user) {
      throw new Error('用户验证失败');
    }

    res.json({ success: true, message: '邮箱验证成功' });
  } catch (error) {
    console.error('验证错误:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 