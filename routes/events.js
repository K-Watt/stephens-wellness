const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, eventsController.showEvents);
router.post('/rsvp/:id', requireAuth, eventsController.rsvpEvent);
router.post('/cancel-rsvp/:id', requireAuth, eventsController.cancelRsvp);

module.exports = router;
