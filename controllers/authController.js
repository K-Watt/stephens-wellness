const bcrypt = require('bcrypt');
const db = require('../config/db');

// Show login page
exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

// Handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT u.*, p.first_name, p.last_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    req.flash('success_msg', 'Welcome back!');
    res.redirect('/home');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/auth/login');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

// Show forgot password page
exports.showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password' });
};

// Handle forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      req.flash('error_msg', 'No account found with that email');
      return res.redirect('/auth/forgot-password');
    }

    // In a real application, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with the reset link
    
    // For this demo, we'll just show a success message
    req.flash('success_msg', 'Password reset instructions have been sent to your email');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/auth/forgot-password');
  }
};

// Show reset password page
exports.showResetPassword = (req, res) => {
  const { token } = req.params;
  res.render('auth/reset-password', { title: 'Reset Password', token });
};

// Handle reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect(`/auth/reset-password/${token}`);
  }

  try {
    // In a real application, you would:
    // 1. Verify the token is valid and not expired
    // 2. Get the user associated with the token
    // 3. Update their password
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // For demo purposes, this won't actually work without proper token handling
    req.flash('success_msg', 'Password has been reset successfully');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error_msg', 'An error occurred');
    res.redirect(`/auth/reset-password/${token}`);
  }
};
