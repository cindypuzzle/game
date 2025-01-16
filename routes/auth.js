const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// 登录页面
router.get('/login', (req, res) => {
    res.render('login', { title: '登录' });
});

// 处理账号密码登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }

        // 登录用户
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: '登录失败，请重试' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 注册页面
router.get('/register', (req, res) => {
    res.render('register', { title: '注册' });
});

// 处理注册
router.post('/register', async (req, res) => {
    try {
        const { email, password, nickname } = req.body;
        
        // 检查邮箱是否已被注册
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: '该邮箱已被注册' });
        }

        // 创建新用户
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            nickname
        });
        await user.save();

        // 自动登录新用户
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: '注册成功但登录失败' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        res.status(500).json({ error: '注册失败，请重试' });
    }
});

// 微信登录
router.get('/wechat', passport.authenticate('wechat'));

// 微信登录回调
router.get('/wechat/callback', 
    passport.authenticate('wechat', {
        failureRedirect: '/auth/login',
        successRedirect: '/game'
    })
);

// 登出
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router; 