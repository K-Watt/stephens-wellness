const db = require('../config/db');

exports.showDashboard = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get total points
    const [pointsResult] = await db.query(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_ledger
      WHERE user_id = ?
    `, [userId]);

    const totalPoints = pointsResult[0].total_points;

    // Get activity history
    const [activityHistory] = await db.query(`
      SELECT a.*, at.name as activity_name, at.default_points,
        pl.points as points_awarded
      FROM activities a
      JOIN activity_types at ON a.activity_type_id = at.id
      LEFT JOIN points_ledger pl ON pl.source_type = 'activity' AND pl.source_id = a.id
      WHERE a.user_id = ?
      ORDER BY a.activity_date DESC
      LIMIT 20
    `, [userId]);

    // Get activity count by month (last 6 months)
    const [monthlyActivity] = await db.query(`
      SELECT 
        DATE_FORMAT(activity_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM activities
      WHERE user_id = ? AND activity_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(activity_date, '%Y-%m')
      ORDER BY month DESC
    `, [userId]);

    // Get points by source
    const [pointsBySource] = await db.query(`
      SELECT 
        source_type,
        COALESCE(SUM(points), 0) as total
      FROM points_ledger
      WHERE user_id = ?
      GROUP BY source_type
    `, [userId]);

    // Calculate activity streak (consecutive days with activities)
    const [streakResult] = await db.query(`
      SELECT COUNT(DISTINCT activity_date) as activity_days
      FROM activities
      WHERE user_id = ? AND activity_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [userId]);

    const activityStreak = streakResult[0].activity_days;

    // Get approved vs pending activities count
    const [activityStats] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM activities
      WHERE user_id = ?
      GROUP BY status
    `, [userId]);

    res.render('dashboard', {
      title: 'Dashboard',
      totalPoints,
      activityHistory,
      monthlyActivity,
      pointsBySource,
      activityStreak,
      activityStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/home');
  }
};
