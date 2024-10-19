const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('magic_rings', { title: '神奇四环' });
});

module.exports = router;
