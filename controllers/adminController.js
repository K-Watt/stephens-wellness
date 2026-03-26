const db = require('../config/db');

// Admin Dashboard
exports.showAdminDashboard = async (req, res) => {
  try {
    // Get total users
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Get total activities
    const [activityCount] = await db.query('SELECT COUNT(*) as count FROM activities');
    
    // Get pending activities
    const [pendingCount] = await db.query(
      'SELECT COUNT(*) as count FROM activities WHERE status = ?',
      ['pending']
    );
    
    // Get total events
    const [eventCount] = await db.query(
      'SELECT COUNT(*) as count FROM events WHERE status = ?',
      ['active']
    );
    
    // Get total points awarded
    const [pointsTotal] = await db.query(
      'SELECT COALESCE(SUM(points), 0) as total FROM points_ledger'
    );

    // Get recent activity by month
    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(activity_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM activities
      WHERE activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(activity_date, '%Y-%m')
      ORDER BY month DESC
    `);

    // Get top participants by points
    const [topParticipants] = await db.query(`
      SELECT u.email, p.first_name, p.last_name, 
        COALESCE(SUM(pl.points), 0) as total_points
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN points_ledger pl ON u.id = pl.user_id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY total_points DESC
      LIMIT 10
    `);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        users: userCount[0].count,
        activities: activityCount[0].count,
        pendingActivities: pendingCount[0].count,
        events: eventCount[0].count,
        totalPoints: pointsTotal[0].total
      },
      monthlyStats,
      topParticipants
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'Error loading admin dashboard');
    res.redirect('/home');
  }
};

// Event Management
exports.showManageEvents = async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND rsvp_status = 'going') as rsvp_count
      FROM events e
      ORDER BY e.start_datetime DESC
    `);

    res.render('admin/events', {
      title: 'Manage Events',
      events
    });
  } catch (error) {
    console.error('Manage events error:', error);
    req.flash('error_msg', 'Error loading events');
    res.redirect('/admin');
  }
};

exports.createEvent = async (req, res) => {
  const { title, description, location, start_datetime, end_datetime, capacity } = req.body;

  try {
    await db.query(
      'INSERT INTO events (title, description, location, start_datetime, end_datetime, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, start_datetime, end_datetime, capacity || null, 'active']
    );

    req.flash('success_msg', 'Event created successfully!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Create event error:', error);
    req.flash('error_msg', 'Error creating event');
    res.redirect('/admin/events');
  }
};

exports.editEvent = async (req, res) => {
  const eventId = req.params.id;
  const { title, description, location, start_datetime, end_datetime, capacity } = req.body;

  try {
    await db.query(
      'UPDATE events SET title = ?, description = ?, location = ?, start_datetime = ?, end_datetime = ?, capacity = ? WHERE id = ?',
      [title, description, location, start_datetime, end_datetime, capacity || null, eventId]
    );

    req.flash('success_msg', 'Event updated successfully!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Edit event error:', error);
    req.flash('error_msg', 'Error updating event');
    res.redirect('/admin/events');
  }
};

exports.cancelEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    await db.query(
      'UPDATE events SET status = ? WHERE id = ?',
      ['canceled', eventId]
    );

    req.flash('success_msg', 'Event canceled');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Cancel event error:', error);
    req.flash('error_msg', 'Error canceling event');
    res.redirect('/admin/events');
  }
};

exports.markAttendance = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    // Mark attendance
    await db.query(
      'UPDATE event_rsvps SET attended = true WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    // Get event details for points
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    
    if (events.length > 0) {
      const pointsToAward = 50; // Default event points
      
      // Check if points already awarded
      const [existing] = await db.query(
        'SELECT * FROM points_ledger WHERE user_id = ? AND source_type = ? AND source_id = ?',
        [userId, 'event', eventId]
      );

      if (existing.length === 0) {
        // Award points
        await db.query(
          'INSERT INTO points_ledger (user_id, source_type, source_id, points, reason) VALUES (?, ?, ?, ?, ?)',
          [userId, 'event', eventId, pointsToAward, `Attended event: ${events[0].title}`]
        );
      }
    }

    req.flash('success_msg', 'Attendance marked and points awarded!');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Mark attendance error:', error);
    req.flash('error_msg', 'Error marking attendance');
    res.redirect('/admin/events');
  }
};

// Activity Management
exports.showManageActivities = async (req, res) => {
  try {
    const [activities] = await db.query(`
      SELECT a.*, at.name as activity_name, at.default_points,
        u.email, p.first_name, p.last_name
      FROM activities a
      JOIN activity_types at ON a.activity_type_id = at.id
      JOIN users u ON a.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY a.created_at DESC
    `);

    res.render('admin/activities', {
      title: 'Manage Activities',
      activities
    });
  } catch (error) {
    console.error('Manage activities error:', error);
    req.flash('error_msg', 'Error loading activities');
    res.redirect('/admin');
  }
};

exports.approveActivity = async (req, res) => {
  const activityId = req.params.id;

  try {
    // Get activity details
    const [activities] = await db.query(`
      SELECT a.*, at.default_points, at.name as activity_name
      FROM activities a
      JOIN activity_types at ON a.activity_type_id = at.id
      WHERE a.id = ?
    `, [activityId]);

    if (activities.length === 0) {
      req.flash('error_msg', 'Activity not found');
      return res.redirect('/admin/activities');
    }

    const activity = activities[0];

    // Update activity status
    await db.query(
      'UPDATE activities SET status = ? WHERE id = ?',
      ['approved', activityId]
    );

    // Award points
    await db.query(
      'INSERT INTO points_ledger (user_id, source_type, source_id, points, reason) VALUES (?, ?, ?, ?, ?)',
      [activity.user_id, 'activity', activityId, activity.default_points, `Activity: ${activity.activity_name}`]
    );

    req.flash('success_msg', 'Activity approved and points awarded!');
    res.redirect('/admin/activities');
  } catch (error) {
    console.error('Approve activity error:', error);
    req.flash('error_msg', 'Error approving activity');
    res.redirect('/admin/activities');
  }
};

exports.rejectActivity = async (req, res) => {
  const activityId = req.params.id;

  try {
    await db.query(
      'UPDATE activities SET status = ? WHERE id = ?',
      ['rejected', activityId]
    );

    req.flash('success_msg', 'Activity rejected');
    res.redirect('/admin/activities');
  } catch (error) {
    console.error('Reject activity error:', error);
    req.flash('error_msg', 'Error rejecting activity');
    res.redirect('/admin/activities');
  }
};

// Announcement Management
exports.showManageAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT a.*, u.email as created_by_email
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);

    res.render('admin/announcements', {
      title: 'Manage Announcements',
      announcements
    });
  } catch (error) {
    console.error('Manage announcements error:', error);
    req.flash('error_msg', 'Error loading announcements');
    res.redirect('/admin');
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, body, publish_start, publish_end } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'INSERT INTO announcements (title, body, publish_start, publish_end, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, body, publish_start, publish_end || null, userId]
    );

    req.flash('success_msg', 'Announcement created successfully!');
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Create announcement error:', error);
    req.flash('error_msg', 'Error creating announcement');
    res.redirect('/admin/announcements');
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const announcementId = req.params.id;

  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [announcementId]);

    req.flash('success_msg', 'Announcement deleted');
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Delete announcement error:', error);
    req.flash('error_msg', 'Error deleting announcement');
    res.redirect('/admin/announcements');
  }
};

// Group Management
exports.showManageGroups = async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
      FROM \`groups\` g
      ORDER BY g.name
    `);

    res.render('admin/groups', {
      title: 'Manage Groups',
      groups
    });
  } catch (error) {
    console.error('Manage groups error:', error);
    req.flash('error_msg', 'Error loading groups');
    res.redirect('/admin');
  }
};

exports.createGroup = async (req, res) => {
  const { name, description } = req.body;

  try {
    await db.query(
      'INSERT INTO groups (name, description, is_active) VALUES (?, ?, ?)',
      [name, description, true]
    );

    req.flash('success_msg', 'Group created successfully!');
    res.redirect('/admin/groups');
  } catch (error) {
    console.error('Create group error:', error);
    req.flash('error_msg', 'Error creating group');
    res.redirect('/admin/groups');
  }
};

exports.editGroup = async (req, res) => {
  const groupId = req.params.id;
  const { name, description } = req.body;

  try {
    await db.query(
      'UPDATE groups SET name = ?, description = ? WHERE id = ?',
      [name, description, groupId]
    );

    req.flash('success_msg', 'Group updated successfully!');
    res.redirect('/admin/groups');
  } catch (error) {
    console.error('Edit group error:', error);
    req.flash('error_msg', 'Error updating group');
    res.redirect('/admin/groups');
  }
};

exports.toggleGroup = async (req, res) => {
  const groupId = req.params.id;

  try {
    await db.query(
      'UPDATE groups SET is_active = NOT is_active WHERE id = ?',
      [groupId]
    );

    req.flash('success_msg', 'Group status updated');
    res.redirect('/admin/groups');
  } catch (error) {
    console.error('Toggle group error:', error);
    req.flash('error_msg', 'Error updating group');
    res.redirect('/admin/groups');
  }
};

// Points Management
exports.awardPoints = async (req, res) => {
  const { user_ids, points, reason } = req.body;

  try {
    const userIdArray = Array.isArray(user_ids) ? user_ids : [user_ids];

    for (const userId of userIdArray) {
      await db.query(
        'INSERT INTO points_ledger (user_id, source_type, source_id, points, reason) VALUES (?, ?, ?, ?, ?)',
        [userId, 'admin', null, points, reason]
      );
    }

    req.flash('success_msg', `Points awarded to ${userIdArray.length} user(s)!`);
    res.redirect('/admin');
  } catch (error) {
    console.error('Award points error:', error);
    req.flash('error_msg', 'Error awarding points');
    res.redirect('/admin');
  }
};

exports.adjustPoints = async (req, res) => {
  const userId = req.params.userId;
  const { points, reason } = req.body;

  try {
    await db.query(
      'INSERT INTO points_ledger (user_id, source_type, source_id, points, reason) VALUES (?, ?, ?, ?, ?)',
      [userId, 'admin', null, parseInt(points), reason]
    );

    req.flash('success_msg', 'Points adjusted successfully!');
    res.redirect('/admin');
  } catch (error) {
    console.error('Adjust points error:', error);
    req.flash('error_msg', 'Error adjusting points');
    res.redirect('/admin');
  }
};
