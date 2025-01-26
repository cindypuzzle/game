const express = require('express');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const recordsRouter = require('./routes/records');

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// 路由
const indexRouter = require('./routes/index');
const memoryGameRouter = require('./routes/memory_game');
const magicRingsRouter = require('./routes/magic_rings');
const spiralGalaxyRouter = require('./routes/spiralGalaxy');
const slidingPuzzleRouter = require('./routes/sliding_puzzle');
app.use('/', indexRouter);
app.use('/game/memory-game', memoryGameRouter);
app.use('/game/magic-rings', magicRingsRouter);
app.use('/game/spiral-galaxy', spiralGalaxyRouter);
app.use('/game/sliding-puzzle', slidingPuzzleRouter);

// 添加2048游戏的路由
app.get('/game/2048', (req, res) => {
    res.render('2048', { title: '2048游戏' });
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

// 添加中间件
app.use(express.json());
app.use(cookieParser());

// 添加路由
app.use('/auth', authRouter);
app.use('/records', recordsRouter);

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
