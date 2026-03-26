const db = require('../config/db');

exports.showEvents = async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Get all active upcoming events
    const [events] = await db.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND rsvp_status = 'going') as rsvp_count,
        (SELECT rsvp_status FROM event_rsvps WHERE event_id = e.id AND user_id = ? LIMIT 1) as user_rsvp_status
      FROM events e
      WHERE e.status = 'active'
      ORDER BY e.start_datetime ASC
    `, [userId]);

    res.render('events', {
      title: 'Events',
      events
    });
  } catch (error) {
    console.error('Events page error:', error);
    req.flash('error_msg', 'Error loading events');
    res.redirect('/home');
  }
};

exports.rsvpEvent = async (req, res) => {
  const userId = req.session.user.id;
  const eventId = req.params.id;

  try {
    // Check if event exists and is active
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ? AND status = ?',
      [eventId, 'active']
    );

    if (events.length === 0) {
      req.flash('error_msg', 'Event not found or is no longer active');
      return res.redirect('/events');
    }

    // Check if already RSVPed
    const [existing] = await db.query(
      'SELECT * FROM event_rsvps WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      // Update existing RSVP
      await db.query(
        'UPDATE event_rsvps SET rsvp_status = ? WHERE event_id = ? AND user_id = ?',
        ['going', eventId, userId]
      );
    } else {
      // Create new RSVP
      await db.query(
        'INSERT INTO event_rsvps (event_id, user_id, rsvp_status, attended) VALUES (?, ?, ?, ?)',
        [eventId, userId, 'going', false]
      );
    }

    req.flash('success_msg', 'RSVP confirmed!');
    res.redirect('/events');
  } catch (error) {
    console.error('RSVP error:', error);
    req.flash('error_msg', 'Error processing RSVP');
    res.redirect('/events');
  }
};

exports.cancelRsvp = async (req, res) => {
  const userId = req.session.user.id;
  const eventId = req.params.id;

  try {
    await db.query(
      'UPDATE event_rsvps SET rsvp_status = ? WHERE event_id = ? AND user_id = ?',
      ['canceled', eventId, userId]
    );

    req.flash('success_msg', 'RSVP canceled');
    res.redirect('/events');
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    req.flash('error_msg', 'Error canceling RSVP');
    res.redirect('/events');
  }
};
