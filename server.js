require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Make flash messages and user available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/home', require('./routes/home'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/activities', require('./routes/activities'));
app.use('/events', require('./routes/events'));
app.use('/groups', require('./routes/groups'));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('layouts/main', {
    title: 'Page Not Found',
    body: '<div class="container mt-5"><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/" class="btn btn-primary">Go Home</a></div>'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('layouts/main', {
    title: 'Error',
    
    body: '<div class="container mt-5"><h1>500 - Internal Server Error</h1><p>Something went wrong on our end.</p></div>'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
