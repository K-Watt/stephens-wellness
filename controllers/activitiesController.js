const db = require('../config/db');

exports.showActivities = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get all activity types
    const [activityTypes] = await db.query('SELECT * FROM activity_types ORDER BY name');

    // Get user's activities
    const [userActivities] = await db.query(`
      SELECT a.*, at.name as activity_name, at.default_points,
        pl.points as points_awarded
      FROM activities a
      JOIN activity_types at ON a.activity_type_id = at.id
      LEFT JOIN points_ledger pl ON pl.source_type = 'activity' AND pl.source_id = a.id
      WHERE a.user_id = ?
      ORDER BY a.activity_date DESC
    `, [userId]);

    res.render('activities', {
      title: 'Activities',
      activityTypes,
      userActivities
    });
  } catch (error) {
    console.error('Activities page error:', error);
    req.flash('error_msg', 'Error loading activities');
    res.redirect('/home');
  }
};

exports.logActivity = async (req, res) => {
  const userId = req.session.user.id;
  const { activity_type_id, activity_date, notes } = req.body;

  try {
    // Get activity type to check if duplicates are allowed
    const [activityTypes] = await db.query(
      'SELECT * FROM activity_types WHERE id = ?',
      [activity_type_id]
    );

    if (activityTypes.length === 0) {
      req.flash('error_msg', 'Invalid activity type');
      return res.redirect('/activities');
    }

    const activityType = activityTypes[0];

    // Check for duplicate if not allowed
    if (!activityType.allow_duplicate) {
      const [existing] = await db.query(
        'SELECT * FROM activities WHERE user_id = ? AND activity_type_id = ? AND activity_date = ?',
        [userId, activity_type_id, activity_date]
      );

      if (existing.length > 0) {
        req.flash('error_msg', 'You have already logged this activity for this date');
        return res.redirect('/activities');
      }
    }

    // Insert activity
    await db.query(
      'INSERT INTO activities (user_id, activity_type_id, activity_date, notes, status) VALUES (?, ?, ?, ?, ?)',
      [userId, activity_type_id, activity_date, notes || null, 'pending']
    );

    req.flash('success_msg', 'Activity logged successfully. Pending admin approval.');
    res.redirect('/activities');
  } catch (error) {
    console.error('Log activity error:', error);
    req.flash('error_msg', 'Error logging activity');
    res.redirect('/activities');
  }
};
