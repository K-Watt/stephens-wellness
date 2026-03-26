const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, groupsController.showGroups);
router.get('/:id', requireAuth, groupsController.showGroupDetail);
router.post('/join/:id', requireAuth, groupsController.joinGroup);
router.post('/leave/:id', requireAuth, groupsController.leaveGroup);
router.post('/:id/post', requireAuth, groupsController.createPost);

module.exports = router;
