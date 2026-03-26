const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, homeController.showHome);

module.exports = router;
