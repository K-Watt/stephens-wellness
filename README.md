# Stephens College Wellness Program Web Application

A comprehensive web-based wellness tracking platform for Stephens College employees. This application provides a central place for wellness information, events, activity logging, social groups, announcements, and a points-based rewards system.

## Features

### For Faculty/Staff Users
- **Activity Logging**: Log wellness activities and track progress
- **Events**: Browse, RSVP, and attend wellness events
- **Groups**: Join wellness groups and participate in discussions
- **Dashboard**: View personal metrics, points, and activity history
- **Points System**: Earn points for approved activities and event attendance
- **Profile Management**: Create and update personal profiles

### For Administrators
- **Activity Approval**: Review and approve logged activities
- **Event Management**: Create, edit, and cancel events
- **Announcement Management**: Create and manage announcements
- **Group Management**: Create and manage wellness groups
- **Points Management**: Award and adjust user points
- **Attendance Tracking**: Mark event attendance and award points
- **Metrics Dashboard**: View participation statistics and trends

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **Template Engine**: EJS (Embedded JavaScript)
- **Styling**: Bootstrap 5
- **Authentication**: bcrypt for password hashing, express-session for session management

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm (comes with Node.js)

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd stephens-wellness
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- bcrypt
- ejs
- express-session
- dotenv
- express-validator
- connect-flash
- method-override

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update with your settings:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stephens_wellness

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Application URL
APP_URL=http://localhost:3000
```

**Important**: Change `SESSION_SECRET` to a random, secure string in production.

### 4. Create Database

Log into MySQL:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE stephens_wellness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Run Database Schema

Import the schema to create all tables:

```bash
mysql -u root -p stephens_wellness < db/schema.sql
```

### 6. Seed Database with Sample Data

Import seed data (includes admin user, sample activities, events, groups):

```bash
mysql -u root -p stephens_wellness < db/seed.sql
```

### 7. Start the Application

For development (with auto-reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Credentials

After seeding, you can log in with these accounts:

**Admin Account:**
- Email: `admin@stephens.edu`
- Password: `password123`
- Role: Admin (full access)

**Faculty/Staff Accounts:**
- Email: `faculty1@stephens.edu` or `faculty2@stephens.edu` or `staff1@stephens.edu`
- Password: `password123`
- Role: User

**Note**: Change these passwords immediately in production!

## Database Schema

### Tables

- **users**: User accounts and authentication
- **profiles**: User profile information
- **activity_types**: Types of wellness activities with point values
- **activities**: Logged user activities
- **events**: Wellness events
- **event_rsvps**: Event registrations and attendance
- **points_ledger**: Points transaction history
- **groups**: Wellness groups
- **group_members**: Group membership
- **posts**: Group discussion posts
- **announcements**: System announcements

## Application Structure

```
stephens-wellness/
├── config/              # Database configuration
├── controllers/         # Request handlers
├── middleware/          # Authentication & authorization
├── routes/             # Route definitions
├── views/              # EJS templates
│   ├── layouts/        # Page layouts
│   ├── partials/       # Reusable components
│   ├── auth/           # Authentication pages
│   └── admin/          # Admin pages
├── public/             # Static assets
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   └── images/        # Images
├── db/                # Database scripts
│   ├── schema.sql     # Database schema
│   └── seed.sql       # Sample data
├── server.js          # Application entry point
├── package.json       # Dependencies
└── README.md          # This file
```

## Key Workflows

### Activity Logging Flow
1. User logs an activity from the Activities page
2. Activity is saved with "pending" status
3. Admin reviews and approves/rejects from Admin > Manage Activities
4. On approval, points are automatically added to user's account
5. Points appear in user's dashboard and points ledger

### Event Flow
1. Admin creates an event from Admin > Manage Events
2. Event appears on Events page for all users
3. Users can RSVP for events
4. Admin marks attendance after the event
5. Points are automatically awarded to attendees

### Points System
- Points are tracked in the `points_ledger` table
- Sources: activities, events, manual admin awards
- Total points = SUM of all ledger entries for a user
- Points are only awarded when:
  - Activity is approved by admin
  - Event attendance is marked by admin
  - Admin manually awards points

## API Endpoints

### Public Routes
- `GET /` - Landing page
- `GET /auth/login` - Login page
- `POST /auth/login` - Login submission
- `GET /auth/logout` - Logout

### Authenticated Routes
- `GET /home` - User home page
- `GET /dashboard` - User dashboard
- `GET /activities` - Activities page
- `POST /activities/log` - Log an activity
- `GET /events` - Events page
- `POST /events/rsvp/:id` - RSVP for event
- `GET /groups` - Groups listing
- `GET /groups/:id` - Group detail
- `POST /groups/join/:id` - Join a group
- `POST /groups/:id/post` - Create post in group
- `GET /profile` - User profile
- `POST /profile/update` - Update profile

### Admin Routes (Admin Only)
- `GET /admin` - Admin dashboard
- `GET /admin/activities` - Manage activities
- `POST /admin/activities/approve/:id` - Approve activity
- `GET /admin/events` - Manage events
- `POST /admin/events/create` - Create event
- `GET /admin/announcements` - Manage announcements
- `POST /admin/announcements/create` - Create announcement
- `GET /admin/groups` - Manage groups
- `POST /admin/groups/create` - Create group

## Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **Session Management**: Secure HTTP-only cookies
- **SQL Injection Protection**: Parameterized queries
- **Authorization**: Role-based access control for admin routes
- **CSRF Protection**: Can be added with csurf package (optional)

## Development

### Running in Development Mode

```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

### Database Management

To reset the database:

```bash
mysql -u root -p stephens_wellness < db/schema.sql
mysql -u root -p stephens_wellness < db/seed.sql
```

## Production Deployment

### Pre-deployment Checklist

1. Change `SESSION_SECRET` in `.env` to a strong random value
2. Set `NODE_ENV=production` in `.env`
3. Update all default passwords
4. Configure database backups
5. Set up HTTPS (required for secure cookies)
6. Review and update `APP_URL` in `.env`

### Environment Variables for Production

```env
NODE_ENV=production
SESSION_SECRET=<strong-random-secret>
DB_HOST=<production-db-host>
DB_USER=<production-db-user>
DB_PASSWORD=<strong-password>
DB_NAME=stephens_wellness
APP_URL=https://yourdomain.com
```

## Troubleshooting

### Database Connection Errors

- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use

- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or stop the process using port 3000

### Session Not Persisting

- Check that `SESSION_SECRET` is set in `.env`
- Verify cookies are enabled in browser
- For production, ensure HTTPS is configured

## Testing

To verify the application is working:

1. Visit `http://localhost:3000` - should see landing page
2. Visit `http://localhost:3000/health` - should return `{"status":"OK"}`
3. Log in with admin credentials
4. Navigate through all pages
5. Test activity logging and approval workflow
6. Test event creation and RSVP

## Future Enhancements

Potential features for future development:
- Email notifications for activity approvals
- Advanced reporting and analytics
- Mobile app integration
- Calendar integration
- Rewards catalog
- Team challenges
- Gamification features
- API for third-party integrations

## Support

For issues or questions:
- Check this README
- Review database schema in `db/schema.sql`
- Examine seed data in `db/seed.sql`
- Check server logs for error messages

## License

MIT License - Free to use and modify for educational purposes.

## Credits

Developed for Stephens College CS499 Capstone Experience.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
