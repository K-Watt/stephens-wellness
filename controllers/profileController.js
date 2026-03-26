const db = require('../config/db');

exports.showProfile = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get user and profile data
    const [users] = await db.query(`
      SELECT u.*, p.first_name, p.last_name, p.department, p.bio, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [userId]);

    if (users.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/home');
    }

    const user = users[0];

    // Get total points
    const [pointsResult] = await db.query(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM points_ledger
      WHERE user_id = ?
    `, [userId]);

    const totalPoints = pointsResult[0].total_points;

    res.render('profile', {
      title: 'Profile',
      profile: user,
      totalPoints
    });
  } catch (error) {
    console.error('Profile page error:', error);
    req.flash('error_msg', 'Error loading profile');
    res.redirect('/home');
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.session.user.id;
  const { first_name, last_name, department, bio } = req.body;

  try {
    // Check if profile exists
    const [existing] = await db.query(
      'SELECT * FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing profile
      await db.query(
        'UPDATE profiles SET first_name = ?, last_name = ?, department = ?, bio = ? WHERE user_id = ?',
        [first_name, last_name, department, bio, userId]
      );
    } else {
      // Create new profile
      await db.query(
        'INSERT INTO profiles (user_id, first_name, last_name, department, bio) VALUES (?, ?, ?, ?, ?)',
        [userId, first_name, last_name, department, bio]
      );
    }

    // Update session data
    req.session.user.first_name = first_name;
    req.session.user.last_name = last_name;

    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (error) {
    console.error('Update profile error:', error);
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/profile');
  }
};
