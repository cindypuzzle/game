const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 登录页面
router.get('/', (req, res) => {
    res.render('auth', { title: '登录/注册' });
});

// 处理登录请求
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('尝试登录:', { email }); // 不要记录密码
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // 设置会话
        req.session.user = data.user;
        
        console.log('登录成功:', data.user);
        res.json({ user: data.user });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(400).json({ error: error.message });
    }
});

// 处理注册请求
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        console.log('尝试注册:', { email, username }); // 不要记录密码

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                },
                emailRedirectTo: `${process.env.APP_URL}/auth/callback`
            }
        });

        if (error) throw error;

        // 注册成功后直接登录用户
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) throw loginError;

        // 设置会话
        req.session.user = loginData.user;

        res.json({
            success: true,
            message: '注册成功！',
            email: email, // 返回邮箱以便前端使用
            redirectTo: '/' // 直接重定向到首页
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(400).json({ error: error.message });
    }
});

// 处理登出请求
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // 清除会话
        req.session.destroy();
        
        res.json({ message: '已成功登出' });
    } catch (error) {
        console.error('登出错误:', error);
        res.status(400).json({ error: error.message });
    }
});

// 获取当前用户
router.get('/user', async (req, res) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        res.json({ user });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(400).json({ error: error.message });
    }
});

// 修改回调路由
router.get('/callback', async (req, res) => {
  try {
    console.log('\n=== 验证回调详细调试信息 ===');
    console.log('1. 原始请求信息:');
    console.log('完整URL:', req.originalUrl);
    console.log('路径:', req.path);
    console.log('查询参数:', req.query);
    console.log('请求头:', req.headers);
    console.log('------------------------');

    // 首先渲染一个中间页面来处理 hash
    if (!req.query.access_token) {
      console.log('2. 未找到 access_token, 返回处理页面');
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>处理验证</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div id="message">正在处理验证...</div>
          
          <script>
            console.log('=== 客户端 hash 处理 ===');
            console.log('当前 URL:', window.location.href);
            console.log('Hash:', window.location.hash);
            
            function handleCallback() {
              try {
                // 获取 hash 或 search 参数
                let params = {};
                if (window.location.hash) {
                  // 处理 hash 参数
                  const hashParams = new URLSearchParams(window.location.hash.substring(1));
                  params = Object.fromEntries(hashParams.entries());
                } else if (window.location.search) {
                  // 处理 search 参数
                  const searchParams = new URLSearchParams(window.location.search);
                  params = Object.fromEntries(searchParams.entries());
                }
                
                console.log('解析的参数:', params);
                
                if (params.access_token) {
                  // 构建新的 URL
                  const newUrl = '/auth/callback?' + new URLSearchParams(params).toString();
                  console.log('重定向到:', newUrl);
                  window.location.replace(newUrl);
                } else {
                  document.getElementById('message').textContent = '验证失败：未找到访问令牌';
                  setTimeout(() => window.location.href = '/auth', 3000);
                }
              } catch (error) {
                console.error('处理回调错误:', error);
                document.getElementById('message').textContent = '验证失败：' + error.message;
                setTimeout(() => window.location.href = '/auth', 3000);
              }
            }

            // 延迟执行以确保 URL 已完全加载
            setTimeout(handleCallback, 100);
          </script>
        </body>
        </html>
      `);
    }

    console.log('5. 找到 access_token, 处理验证:');
    console.log('Token:', access_token?.substring(0, 20) + '...');
    console.log('类型:', type);

    // 处理带有 token 的请求
    const { access_token, refresh_token, error, error_description, type } = req.query;

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

    // 设置会话
    req.session.user = user;
    
    console.log('验证成功，用户信息:', user);

    // 重定向到主页
    res.redirect('/');

  } catch (error) {
    console.error('\n=== 验证失败详细信息 ===');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求参数:', {
      path: req.path,
      query: req.query,
      headers: req.headers
    });
    console.error('========================\n');
    
    res.render('auth-callback', {
      message: '验证失败：' + error.message,
      redirect: '/auth',
      debug: {
        path: req.path,
        query: JSON.stringify(req.query),
        error: error.message
      }
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

router.post('/update-username', async (req, res) => {
  try {
    const { username } = req.body;
    const { user } = req.session;

    if (!user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { error } = await supabase.auth.updateUser({
      data: { username }
    });

    if (error) throw error;

    res.json({ success: true, message: '用户名更新成功' });
  } catch (error) {
    console.error('更新用户名失败:', error);
    res.status(500).json({ error: '更新用户名失败' });
  }
});

module.exports = router; 