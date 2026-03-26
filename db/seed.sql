-- Seed data for Stephens College Wellness Program

-- Insert users
-- Password for all users is: password123
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (email, password_hash, role) VALUES
('admin@stephens.edu', '$2b$10$HS0ngDiSv0f/NfdDjdQ5E.2v0saryTS/yORoahOIamez/6lJ1R6QS', 'admin'),
('faculty1@stephens.edu', '$2b$10$HS0ngDiSv0f/NfdDjdQ5E.2v0saryTS/yORoahOIamez/6lJ1R6QS', 'user'),
('faculty2@stephens.edu', '$2b$10$HS0ngDiSv0f/NfdDjdQ5E.2v0saryTS/yORoahOIamez/6lJ1R6QS', 'user'),
('staff1@stephens.edu', '$2b$10$HS0ngDiSv0f/NfdDjdQ5E.2v0saryTS/yORoahOIamez/6lJ1R6QS', 'user');

-- Insert profiles
INSERT INTO profiles (user_id, first_name, last_name, department, bio) VALUES
(1, 'Admin', 'User', 'Administration', 'Wellness Program Administrator'),
(2, 'Jane', 'Smith', 'Computer Science', 'Passionate about health and wellness'),
(3, 'John', 'Doe', 'Mathematics', 'Fitness enthusiast'),
(4, 'Sarah', 'Johnson', 'Student Services', 'Love group activities and events');

-- Insert activity types
INSERT INTO activity_types (name, default_points, allow_duplicate) VALUES
('Daily Walk (30+ min)', 10, true),
('Gym Workout', 15, true),
('Yoga Class', 12, true),
('Health Screening', 50, false),
('Wellness Workshop Attendance', 20, false),
('Meditation Session', 8, true),
('Team Sports', 15, true),
('Cycling (30+ min)', 12, true);

-- Insert events
INSERT INTO events (title, description, location, start_datetime, end_datetime, capacity, status) VALUES
('Spring Wellness Fair', 'Annual wellness fair with health screenings, fitness demos, and vendor booths', 'Student Center Main Hall', '2026-03-15 10:00:00', '2026-03-15 15:00:00', 100, 'active'),
('Yoga in the Park', 'Outdoor yoga session for all skill levels', 'Campus Green', '2026-02-20 17:00:00', '2026-02-20 18:00:00', 30, 'active'),
('Nutrition Workshop', 'Learn about healthy eating habits and meal planning', 'Library Conference Room', '2026-02-25 12:00:00', '2026-02-25 13:30:00', 25, 'active'),
('5K Fun Run', 'Community fun run around campus', 'Campus Track', '2026-03-01 08:00:00', '2026-03-01 10:00:00', 50, 'active');

-- Insert groups
INSERT INTO `groups` (name, description, is_active) VALUES
('Walking Club', 'Daily walking group that meets at lunchtime for a 30-minute walk around campus', true),
('Yoga Enthusiasts', 'Group for yoga lovers to share tips, poses, and organize practice sessions', true),
('Healthy Cooking', 'Share recipes, cooking tips, and organize healthy potluck events', true),
('Fitness Challenges', 'Participate in monthly fitness challenges and motivate each other', true);

-- Insert some group memberships
INSERT INTO group_members (group_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 2),
(2, 4),
(3, 3),
(3, 4),
(4, 2),
(4, 3),
(4, 4);

-- Insert some posts
INSERT INTO posts (group_id, user_id, content) VALUES
(1, 2, 'Great walk today! The weather was perfect. Who\'s joining tomorrow?'),
(1, 3, 'I\'m in! Same time and place?'),
(2, 2, 'Just tried this new yoga sequence and it was amazing! Link: [example]'),
(3, 4, 'Made a delicious quinoa salad today. Recipe coming soon!'),
(4, 3, 'Ready for this month\'s plank challenge! Who\'s with me?');

-- Insert announcements
INSERT INTO announcements (title, body, publish_start, publish_end, created_by) VALUES
('Welcome to Wellness Program', 'We\'re excited to launch the Stephens College Wellness Program! Start logging your activities, join groups, and earn points for a healthier you.', '2026-01-01 00:00:00', '2026-03-31 23:59:59', 1),
('Spring Wellness Fair - March 15', 'Don\'t miss our Spring Wellness Fair! Free health screenings, fitness demonstrations, healthy snacks, and great prizes. Mark your calendars!', '2026-02-01 00:00:00', '2026-03-15 23:59:59', 1),
('New Yoga Classes Starting', 'We\'re adding two new yoga class times: Tuesdays at 7am and Thursdays at 6pm. All levels welcome!', '2026-02-01 00:00:00', NULL, 1);

-- Insert some sample activities
INSERT INTO activities (user_id, activity_type_id, activity_date, notes, status) VALUES
(2, 1, '2026-01-28', 'Morning walk around campus', 'approved'),
(2, 2, '2026-01-29', 'Full body workout at campus gym', 'approved'),
(3, 1, '2026-01-28', 'Lunchtime walk with colleagues', 'approved'),
(3, 3, '2026-01-27', 'Attended community yoga class', 'approved'),
(4, 1, '2026-01-30', 'Evening walk', 'pending'),
(2, 6, '2026-01-30', '15 minute meditation session', 'pending');

-- Insert some sample points (for approved activities)
INSERT INTO points_ledger (user_id, source_type, source_id, points, reason) VALUES
(2, 'activity', 1, 10, 'Activity: Daily Walk (30+ min)'),
(2, 'activity', 2, 15, 'Activity: Gym Workout'),
(3, 'activity', 3, 10, 'Activity: Daily Walk (30+ min)'),
(3, 'activity', 4, 12, 'Activity: Yoga Class'),
(2, 'admin', NULL, 25, 'Bonus for consistent participation!');

-- Insert some event RSVPs
INSERT INTO event_rsvps (event_id, user_id, rsvp_status, attended) VALUES
(1, 2, 'going', false),
(1, 3, 'going', false),
(1, 4, 'going', false),
(2, 2, 'going', false),
(2, 4, 'going', false),
(3, 3, 'going', false);
