const express = require('express');
const path = require('path');
const app = express();

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// 路由
const indexRouter = require('./routes/index');
const memoryGameRouter = require('./routes/memory_game');
const magicRingsRouter = require('./routes/magic_rings');
const symmetricPartitionRouter = require('./routes/symmetric_partition');
const spiralGalaxyRouter = require('./routes/spiralGalaxy');
app.use('/', indexRouter);
app.use('/game/memory-game', memoryGameRouter);
app.use('/game/magic-rings', magicRingsRouter);
app.use('/game/symmetric-partition', symmetricPartitionRouter);
app.use('/game/spiral-galaxy', spiralGalaxyRouter);

// 添加2048游戏的路由
app.get('/game/2048', (req, res) => {
    res.render('2048', { title: '2048游戏' });
});

app.get('/game/guess-number', (req, res) => {
  res.render('guess_number');
});

// 在其他路由定义之后添加这个新路由
app.get('/game/snake', (req, res) => {
    res.render('snake', { title: '贪吃蛇' });
});

// 在其他路由之后添加这个
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
