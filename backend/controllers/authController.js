const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (recipientEmail, verificationUrl) => {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.warn('Resend API key is missing or still set to the placeholder value. Skipping verification email.');
    return false;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: 'Verify your email',
      html: `<p>Welcome!</p><p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    });
    return true;
  } catch (emailError) {
    console.warn('Verification email could not be sent:', emailError.message);
    return false;
  }
};

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const recipientEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: recipientEmail });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email: recipientEmail }, jwtSecret, { expiresIn: '24h' });

    const user = new User({ name, email: recipientEmail, password: hashedPassword, otp: null, otpExpires: null });
    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-otp?token=${verificationToken}`;
    const emailSent = await sendVerificationEmail(recipientEmail, verificationUrl);

    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Verification email sent.'
        : 'User registered successfully. Verification email could not be sent right now.',
      email: recipientEmail,
      emailSent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- VERIFY TOKEN ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const authToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Email verified', token: authToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const recipientEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: recipientEmail });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = jwt.sign({ email: recipientEmail }, jwtSecret, { expiresIn: '1h' });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    res.json({
      message: 'Password reset link sent to your email.',
      email: recipientEmail
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};