// 在文件的其他路由之后添加这个新路由
router.get('/snake', (req, res) => {
    res.render('snake', { title: '贪吃蛇' });
});
