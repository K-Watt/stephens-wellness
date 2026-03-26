const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, activitiesController.showActivities);
router.post('/log', requireAuth, activitiesController.logActivity);

module.exports = router;
