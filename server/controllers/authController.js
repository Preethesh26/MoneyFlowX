const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });
    await user.save();

    // Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlySalary: user.monthlySalary,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email ? email.toLowerCase().trim() : '' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlySalary: user.monthlySalary,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile (name, monthlySalary, currency)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, monthlySalary, currency } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (monthlySalary !== undefined) updates.monthlySalary = monthlySalary;
    if (currency !== undefined) updates.currency = currency;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/auth/profile/picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    await User.findByIdAndUpdate(req.user.id, { profilePicture: req.file.path });

    return res.status(200).json({ profilePicture: req.file.path });
  } catch (err) {
    next(err);
  }
};

const crypto = require('crypto')
const nodemailer = require('nodemailer')

// In-memory store for reset tokens (use Redis/DB in production)
const resetTokens = new Map()

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Always return success to prevent email enumeration
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' })

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = Date.now() + 1000 * 60 * 30 // 30 minutes
    resetTokens.set(token, { userId: user._id.toString(), expiry })

    const resetUrl = `${process.env.CLIENT_URL || 'https://money-flow-x.vercel.app'}/reset-password?token=${token}`

    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"MoneyFlowX" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your MoneyFlowX password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#6c63ff;margin-bottom:8px">MoneyFlowX 💸</h2>
          <p style="color:#a0a0b8">You requested a password reset.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#6c63ff;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">Reset Password</a>
          <p style="color:#6b6b8a;font-size:12px">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) { next(err) }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const record = resetTokens.get(token)
    if (!record || record.expiry < Date.now()) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.findByIdAndUpdate(record.userId, { password: hashedPassword })
    resetTokens.delete(token)

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (err) { next(err) }
}
