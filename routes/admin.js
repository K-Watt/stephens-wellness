const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Admin dashboard
router.get('/', requireAuth, requireAdmin, adminController.showAdminDashboard);

// Event management
router.get('/events', requireAuth, requireAdmin, adminController.showManageEvents);
router.post('/events/create', requireAuth, requireAdmin, adminController.createEvent);
router.post('/events/edit/:id', requireAuth, requireAdmin, adminController.editEvent);
router.post('/events/cancel/:id', requireAuth, requireAdmin, adminController.cancelEvent);
router.post('/events/attendance/:eventId/:userId', requireAuth, requireAdmin, adminController.markAttendance);

// Activity management
router.get('/activities', requireAuth, requireAdmin, adminController.showManageActivities);
router.post('/activities/approve/:id', requireAuth, requireAdmin, adminController.approveActivity);
router.post('/activities/reject/:id', requireAuth, requireAdmin, adminController.rejectActivity);

// Announcement management
router.get('/announcements', requireAuth, requireAdmin, adminController.showManageAnnouncements);
router.post('/announcements/create', requireAuth, requireAdmin, adminController.createAnnouncement);
router.post('/announcements/delete/:id', requireAuth, requireAdmin, adminController.deleteAnnouncement);

// Group management
router.get('/groups', requireAuth, requireAdmin, adminController.showManageGroups);
router.post('/groups/create', requireAuth, requireAdmin, adminController.createGroup);
router.post('/groups/edit/:id', requireAuth, requireAdmin, adminController.editGroup);
router.post('/groups/toggle/:id', requireAuth, requireAdmin, adminController.toggleGroup);

// Points management
router.post('/points/award', requireAuth, requireAdmin, adminController.awardPoints);
router.post('/points/adjust/:userId', requireAuth, requireAdmin, adminController.adjustPoints);

module.exports = router;
