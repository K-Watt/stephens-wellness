const db = require('../config/db');

exports.showGroups = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get all active groups with membership status
    const [groups] = await db.query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND user_id = ?) as is_member
      FROM \`groups\` g
      WHERE g.is_active = true
      ORDER BY g.name
    `, [userId]);

    res.render('groups', {
      title: 'Groups',
      groups
    });
  } catch (error) {
    console.error('Groups page error:', error);
    req.flash('error_msg', 'Error loading groups');
    res.redirect('/home');
  }
};

exports.showGroupDetail = async (req, res) => {
  const userId = req.session.user.id;
  const groupId = req.params.id;

  try {
    // Get group details
    const [groups] = await db.query(
      'SELECT * FROM `groups` WHERE id = ? AND is_active = true',
      [groupId]
    );

    if (groups.length === 0) {
      req.flash('error_msg', 'Group not found');
      return res.redirect('/groups');
    }

    const group = groups[0];

    // Check if user is a member
    const [membership] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    const isMember = membership.length > 0;

    // Get posts if user is a member
    let posts = [];
    if (isMember) {
      const [postsResult] = await db.query(`
        SELECT p.*, u.email, pr.first_name, pr.last_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN profiles pr ON u.id = pr.user_id
        WHERE p.group_id = ?
        ORDER BY p.created_at DESC
        LIMIT 50
      `, [groupId]);
      posts = postsResult;
    }

    res.render('group-detail', {
      title: group.name,
      group,
      isMember,
      posts
    });
  } catch (error) {
    console.error('Group detail error:', error);
    req.flash('error_msg', 'Error loading group');
    res.redirect('/groups');
  }
};

exports.joinGroup = async (req, res) => {
  const userId = req.session.user.id;
  const groupId = req.params.id;

  try {
    // Check if group exists
    const [groups] = await db.query(
      'SELECT * FROM `groups` WHERE id = ? AND is_active = true',
      [groupId]
    );

    if (groups.length === 0) {
      req.flash('error_msg', 'Group not found');
      return res.redirect('/groups');
    }

    // Check if already a member
    const [existing] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (existing.length > 0) {
      req.flash('error_msg', 'You are already a member of this group');
      return res.redirect(`/groups/${groupId}`);
    }

    // Join group
    await db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    req.flash('success_msg', 'Successfully joined the group!');
    res.redirect(`/groups/${groupId}`);
  } catch (error) {
    console.error('Join group error:', error);
    req.flash('error_msg', 'Error joining group');
    res.redirect('/groups');
  }
};

exports.leaveGroup = async (req, res) => {
  const userId = req.session.user.id;
  const groupId = req.params.id;

  try {
    await db.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    req.flash('success_msg', 'Successfully left the group');
    res.redirect('/groups');
  } catch (error) {
    console.error('Leave group error:', error);
    req.flash('error_msg', 'Error leaving group');
    res.redirect('/groups');
  }
};

exports.createPost = async (req, res) => {
  const userId = req.session.user.id;
  const groupId = req.params.id;
  const { content } = req.body;

  try {
    // Verify user is a member
    const [membership] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (membership.length === 0) {
      req.flash('error_msg', 'You must be a member to post');
      return res.redirect(`/groups/${groupId}`);
    }

    // Create post
    await db.query(
      'INSERT INTO posts (group_id, user_id, content) VALUES (?, ?, ?)',
      [groupId, userId, content]
    );

    req.flash('success_msg', 'Post created successfully!');
    res.redirect(`/groups/${groupId}`);
  } catch (error) {
    console.error('Create post error:', error);
    req.flash('error_msg', 'Error creating post');
    res.redirect(`/groups/${groupId}`);
  }
};
