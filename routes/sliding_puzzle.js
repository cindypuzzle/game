const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('sliding_puzzle', { title: '数字华容道' });
});

module.exports = router; 