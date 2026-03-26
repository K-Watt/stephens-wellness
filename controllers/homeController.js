const db = require('../config/db');

exports.showHome = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get announcements
    const [announcements] = await db.query(`
      SELECT * FROM announcements 
      WHERE publish_start <= NOW() 
      AND (publish_end IS NULL OR publish_end >= NOW())
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Get upcoming events
    const [upcomingEvents] = await db.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND rsvp_status = 'going') as rsvp_count,
        (SELECT rsvp_status FROM event_rsvps WHERE event_id = e.id AND user_id = ? LIMIT 1) as user_rsvp_status
      FROM events e
      WHERE e.status = 'active' AND e.start_datetime > NOW()
      ORDER BY e.start_datetime ASC
      LIMIT 5
    `, [userId]);

    // Get recent activities
    const [recentActivities] = await db.query(`
      SELECT a.*, at.name as activity_name, at.default_points
      FROM activities a
      JOIN activity_types at ON a.activity_type_id = at.id
      WHERE a.user_id = ?
      ORDER BY a.activity_date DESC
      LIMIT 5
    `, [userId]);

    // Get recent points
    const [recentPoints] = await db.query(`
      SELECT * FROM points_ledger
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    // Get total points
    const [pointsResult] = await db.query(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_ledger
      WHERE user_id = ?
    `, [userId]);

    const totalPoints = pointsResult[0].total_points;

    res.render('home', {
      title: 'Home',
      announcements,
      upcomingEvents,
      recentActivities,
      recentPoints,
      totalPoints
    });
  } catch (error) {
    console.error('Home page error:', error);
    req.flash('error_msg', 'Error loading home page');
    res.redirect('/');
  }
};
