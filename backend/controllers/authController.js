const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const { setOtp, getOtp, deleteOtp, invalidateUserCache } = require('../utils/cache');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an OTP email or logs it as a fallback if the API key is not set.
 * Also prints the OTP to the console for easy developer testing.
 */
const sendOTPEmail = async (recipientEmail, otpCode, purpose) => {
  // Always log the OTP to the console for testing convenience
  console.log(`\n=================================================`);
  console.log(`[TESTING OTP] For user: ${recipientEmail}`);
  console.log(`[TESTING OTP] Purpose: ${purpose}`);
  console.log(`[TESTING OTP] Code is: ${otpCode}`);
  console.log(`=================================================\n`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.warn('[EMAIL SENDER] Resend API key is missing or placeholder. Skipping actual email dispatch.');
    return false;
  }

  try {
    const subject = purpose === 'verification' ? 'Verify your email - SecureAuth' : 'Reset your password - SecureAuth';
    const html = purpose === 'verification'
      ? `<div style="font-family: sans-serif; padding: 20px;">
           <h2>Verify your email address</h2>
           <p>Thank you for registering. Please enter the following 6-digit verification code to complete your signup:</p>
           <h1 style="background: #f1f5f9; padding: 15px; display: inline-block; letter-spacing: 5px; font-family: monospace; border-radius: 8px;">${otpCode}</h1>
           <p>This code will expire in 10 minutes.</p>
         </div>`
      : `<div style="font-family: sans-serif; padding: 20px;">
           <h2>Password Reset Request</h2>
           <p>We received a request to reset your password. Please use the following 6-digit code to update your password:</p>
           <h1 style="background: #f1f5f9; padding: 15px; display: inline-block; letter-spacing: 5px; font-family: monospace; border-radius: 8px;">${otpCode}</h1>
           <p>This code will expire in 10 minutes.</p>
         </div>`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: subject,
      html: html
    });
    return true;
  } catch (emailError) {
    console.warn(`[EMAIL SENDER] Email could not be sent to ${recipientEmail}:`, emailError.message);
    return false;
  }
};

// Helper to generate a 6-digit code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const recipientEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: recipientEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and create user as unverified
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: recipientEmail,
      password: hashedPassword,
      isVerified: false
    });
    await user.save();

    // Generate 6-digit OTP and store it in cache for 10 minutes (600s)
    const otpCode = generateOTP();
    setOtp(recipientEmail, otpCode, 'verification', 600);

    // Send email/log OTP
    const emailSent = await sendOTPEmail(recipientEmail, otpCode, 'verification');

    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Verification OTP email sent.'
        : 'User registered successfully. (Local dev: Verification code logged to server console)',
      email: recipientEmail,
      emailSent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- VERIFY OTP ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const targetEmail = email.trim().toLowerCase();
    const submittedOtp = otp.toString().trim();

    // Retrieve cached OTP code
    const cachedOtp = getOtp(targetEmail, 'verification');

    if (!cachedOtp) {
      return res.status(400).json({ message: 'OTP has expired or does not exist. Please request a new code.' });
    }

    if (cachedOtp !== submittedOtp) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    // Update user in DB
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    // Invalidate cached user profile in case they were previously cached
    invalidateUserCache(user._id.toString());

    // Clean up OTP from cache
    deleteOtp(targetEmail, 'verification');

    // Generate authenticated JWT session token (expires in 1 hour)
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Email verified successfully.',
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const targetEmail = email.trim().toLowerCase();

    // Retrieve user
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check verification status
    if (!user.isVerified) {
      // Re-trigger an OTP for convenience
      const otpCode = generateOTP();
      setOtp(targetEmail, otpCode, 'verification', 600);
      await sendOTPEmail(targetEmail, otpCode, 'verification');

      return res.status(403).json({
        message: 'Your email address is not verified yet. We have sent a new verification code to your email.',
        unverified: true,
        email: targetEmail
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();
    invalidateUserCache(user._id.toString()); // invalidate old session cache

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const recipientEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: recipientEmail });
    
    // For security, don't leak whether the email exists, but we can alert the developer in console.
    if (!user) {
      console.warn(`[FORGOT PASSWORD] Requested email does not exist: ${recipientEmail}`);
      return res.status(200).json({
        message: 'If the email exists in our system, a password reset code has been sent.',
        email: recipientEmail
      });
    }

    // Generate reset OTP code and cache it for 10 minutes
    const otpCode = generateOTP();
    setOtp(recipientEmail, otpCode, 'reset', 600);

    // Send email/log OTP
    const emailSent = await sendOTPEmail(recipientEmail, otpCode, 'reset');

    res.status(200).json({
      message: emailSent
        ? 'Password reset OTP code sent to your email.'
        : 'Password reset code generated. (Local dev: Reset code logged to server console)',
      email: recipientEmail,
      emailSent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP code, and new password are required' });
    }

    const targetEmail = email.trim().toLowerCase();
    const submittedOtp = otp.toString().trim();

    // Verify OTP from cache
    const cachedOtp = getOtp(targetEmail, 'reset');

    if (!cachedOtp) {
      return res.status(400).json({ message: 'OTP has expired or does not exist. Please request a new code.' });
    }

    if (cachedOtp !== submittedOtp) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    // Retrieve user and reset password
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clear caches
    invalidateUserCache(user._id.toString());
    deleteOtp(targetEmail, 'reset');

    res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET CURRENT USER (ME) ----------------
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};