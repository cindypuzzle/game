const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('spiralGalaxy', { title: '螺旋星系' });
});

module.exports = router;
