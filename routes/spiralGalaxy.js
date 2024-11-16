const express = require('express');
const router = express.Router();
const puzzles = require('../config/puzzles');

router.get('/', (req, res) => {
    const puzzleId = req.query.id || 1; // 默认显示第1题
    const puzzle = puzzles[puzzleId];
    
    res.render('spiralGalaxy', {
        title: '星系拼图',
        puzzleId: puzzleId,
        puzzle: puzzle
    });
});

module.exports = router;
