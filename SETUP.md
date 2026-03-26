# Quick Setup Guide

## One-Time Setup (First Time Only)

### 1. Install Node.js and MySQL
- Download and install Node.js from https://nodejs.org (v14+)
- Download and install MySQL from https://dev.mysql.com/downloads/mysql/ (v5.7+)

### 2. Set Up Project

```bash
# Navigate to project directory
cd stephens-wellness

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file and update:
# - DB_PASSWORD to your MySQL password
# - SESSION_SECRET to a random string
```

### 3. Set Up Database

```bash
# Login to MySQL
mysql -u root -p

# Create database (in MySQL prompt)
CREATE DATABASE stephens_wellness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import schema
mysql -u root -p stephens_wellness < db/schema.sql

# Import seed data
mysql -u root -p stephens_wellness < db/seed.sql
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Access the Application
- Open browser to: http://localhost:3000
- Login with:
  - Email: admin@stephens.edu
  - Password: password123

## Quick Test

1. Visit http://localhost:3000 (landing page)
2. Click "Sign In to Get Started"
3. Use admin credentials above
4. Explore:
   - Home (dashboard with announcements)
   - Activities (log an activity)
   - Events (view and RSVP)
   - Groups (join and post)
   - Admin (approve activities, manage events)

## Troubleshooting

### "Cannot connect to database"
- Ensure MySQL is running
- Check DB_PASSWORD in .env matches your MySQL password
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "Port 3000 already in use"
- Change PORT in .env to 3001 or another available port

### "Module not found"
- Run `npm install` again

## Reset Database (if needed)

```bash
mysql -u root -p stephens_wellness < db/schema.sql
mysql -u root -p stephens_wellness < db/seed.sql
```

This will drop all tables and recreate with fresh seed data.
