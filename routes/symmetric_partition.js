const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('symmetric_partition', { title: '对称分区' });
});

module.exports = router;
