const express = require('express');
const router = express.Router();
const { redirectIfAuth } = require('../middleware/auth');

// Landing page (standalone layout - no main layout wrapper)
router.get('/', redirectIfAuth, (req, res) => {
  res.render('landing', { title: 'Stephens College Wellness Program', layout: false });
});

module.exports = router;
