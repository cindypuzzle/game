const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('sliding_puzzle', { title: '一举两得' });
});

module.exports = router; 