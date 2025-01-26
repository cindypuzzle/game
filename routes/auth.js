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
    
    console.log('开始注册流程...');
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    
    // 测试 Supabase 连接
    try {
      const { data: testData, error: testError } = await supabase.from('auth.users').select('count').limit(1);
      if (testError) {
        console.error('Supabase 连接测试失败:', testError);
      } else {
        console.log('Supabase 连接测试成功');
      }
    } catch (testError) {
      console.error('Supabase 连接测试异常:', testError);
    }

    // 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${process.env.SITE_URL}/auth/callback`,
        redirectTo: `${process.env.SITE_URL}/auth/callback`
      }
    });

    if (authError) {
      console.error('注册错误:', authError);
      throw authError;
    }

    console.log('注册成功:', authData);

    res.json({ 
      message: '注册成功,请查收验证邮件',
      user: authData.user 
    });
  } catch (error) {
    console.error('注册异常:', error);
    // 检查是否是网络错误
    if (error.code === 'ENOTFOUND') {
      res.status(503).json({ 
        error: '网络连接失败，请检查网络设置或稍后重试',
        details: error.message 
      });
    } else {
      res.status(400).json({ 
        error: error.message,
        details: error.cause?.message || '未知错误' 
      });
    }
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
    console.log('完整URL:', req.originalUrl);
    console.log('========================');

    // 首先渲染一个中间页面来处理 hash
    if (!req.query.access_token) {
      return res.send(`
        <script>
          // 从 URL hash 中获取参数
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const params = Object.fromEntries(hashParams.entries());
          
          // 将参数添加到 URL query 中
          const newUrl = '/auth/callback?' + new URLSearchParams(params).toString();
          
          // 重定向到新的 URL
          window.location.replace(newUrl);
        </script>
      `);
    }

    // 处理带有 token 的请求
    const { access_token, refresh_token, error, error_description } = req.query;

    // 检查是否有错误
    if (error) {
      throw new Error(`认证错误: ${error_description || error}`);
    }

    if (!access_token) {
      throw new Error('未找到访问令牌');
    }

    // 使用 token 设置会话
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (sessionError) {
      console.error('设置会话错误:', sessionError);
      throw sessionError;
    }

    // 设置 cookie
    if (data?.session) {
      res.cookie('sb-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
      });
    }

    // 获取用户信息
    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);
    
    if (userError) {
      console.error('获取用户信息错误:', userError);
      throw userError;
    }

    if (!user) {
      throw new Error('无法获取用户信息');
    }

    console.log('验证成功，用户信息:', user);

    // 重定向到主页
    res.redirect('/');

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