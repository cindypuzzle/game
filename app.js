const express = require('express');
const path = require('path');
// 添加 dotenv 配置
require('dotenv').config();

const mongoose = require('mongoose');
const passport = require('passport');
const WechatStrategy = require('passport-wechat').Strategy;
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const User = require('./models/user');
const session = require('express-session');

// 创建 Express 应用实例
const app = express();

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// 连接数据库并添加错误处理
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('成功连接到MongoDB数据库');
  })
  .catch((err) => {
    console.error('MongoDB连接错误:', err);
  });

// 中间件
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// 配置微信登录策略
passport.use(new WechatStrategy({
    appID: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
    callbackURL: process.env.WECHAT_CALLBACK_URL,
    scope: 'snsapi_userinfo',
    state: true
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ wechatId: profile.id });
      
      if (!user) {
        user = new User({
          wechatId: profile.id,
          nickname: profile.displayName,
          avatar: profile.photos[0].value
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// 序列化和反序列化用户对象
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// 路由
const indexRouter = require('./routes/index');
const memoryGameRouter = require('./routes/memory_game');
const magicRingsRouter = require('./routes/magic_rings');
const spiralGalaxyRouter = require('./routes/spiralGalaxy');
const slidingPuzzleRouter = require('./routes/sliding_puzzle');
const authRouter = require('./routes/auth');

// 先添加不需要验证的路由
app.use('/', indexRouter);
app.use('/auth', authRouter);

// 添加身份验证中间件来保护所有游戏路由
app.use('/game', auth);

// 添加需要登录才能访问的游戏路由
app.use('/game/memory-game', memoryGameRouter);
app.use('/game/magic-rings', magicRingsRouter);
app.use('/game/spiral-galaxy', spiralGalaxyRouter);
app.use('/game/sliding-puzzle', slidingPuzzleRouter);

// 其他游戏路由也需要放在 auth 中间件之后
app.get('/game/2048', (req, res) => {
    res.render('2048', { title: '2048游戏' });
});

app.get('/game/guess-number', (req, res) => {
    res.render('guess_number');
});

app.get('/game/snake', (req, res) => {
    res.render('snake', { title: '贪吃蛇' });
});

app.get('/game/spiral-galaxy', (req, res) => {
    res.render('spiral_galaxy', { title: '星系重逢' });
});

// 错误处理中间件
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
