const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { 
        title: '游戏中心',
        user: req.user // 传递用户信息到模板
    });
});

module.exports = router;
