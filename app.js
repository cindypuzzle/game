const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const recordsRouter = require('./routes/records');
const profileRouter = require('./routes/profile');
const session = require('express-session');
const supabase = require('./config/supabase');
require('dotenv').config();

// 导入用户验证中间件
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 添加中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'your-secret-key'));

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// Session 配置
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// 统一的用户身份验证中间件
app.use(async (req, res, next) => {
    console.log('当前域名:', req.get('host'));
    console.log('Cookie 设置:', req.cookies);
    const token = req.cookies.access_token;
    if (token) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
                res.locals.user = user;
            }
        } catch (err) {
            console.error('验证用户token失败:', err);
        }
    }
    next();
});

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log('请求信息:', {
        path: req.path,
        cookies: req.cookies,
        headers: req.headers,
        session: req.session
    });
    next();
});

// 路由
const indexRouter = require('./routes/index');
const memoryGameRouter = require('./routes/memory_game');
const magicRingsRouter = require('./routes/magic_rings');
const spiralGalaxyRouter = require('./routes/spiralGalaxy');
const slidingPuzzleRouter = require('./routes/sliding_puzzle');

// 添加路由
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/records', recordsRouter);
app.use('/profile', profileRouter);
app.use('/game/memory-game', memoryGameRouter);
app.use('/game/magic-rings', magicRingsRouter);
app.use('/game/spiral-galaxy', spiralGalaxyRouter);
app.use('/game/sliding-puzzle', slidingPuzzleRouter);

// 修改2048游戏的路由
app.get('/game/2048', checkUser, async (req, res) => {
    res.render('2048', { 
        title: '2048游戏',
        user: res.locals.user  // 使用中间件设置的用户信息
    });
});

app.get('/game/guess-number', (req, res) => {
  res.render('guess_number');
});

// 贪吃蛇游戏路由
app.get('/game/snake', (req, res) => {
    res.render('snake', { title: '贪吃蛇' });
});

// 星系重逢游戏路由
app.get('/game/spiral-galaxy', (req, res) => {
    res.render('spiral_galaxy', { title: '星系重逢' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 启动服务器
const PORT = process.env.PORT || 5400;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
