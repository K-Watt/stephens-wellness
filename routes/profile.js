const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, profileController.showProfile);
router.post('/update', requireAuth, profileController.updateProfile);

module.exports = router;
