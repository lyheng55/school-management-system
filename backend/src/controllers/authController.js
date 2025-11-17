const { User, Student, Teacher, Parent } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'teacher', 'student', 'parent').required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

exports.register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { username, password, role, firstName, lastName, email } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this username'
      });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      role,
      email: email || null
    });

    // Create role-specific profile
    let profile;
    if (role === 'student') {
      profile = await Student.create({
        user_id: user.id,
        student_id: `STU${Date.now()}`,
        first_name: firstName,
        last_name: lastName
      });
    } else if (role === 'teacher') {
      profile = await Teacher.create({
        user_id: user.id,
        teacher_id: `TCH${Date.now()}`,
        first_name: firstName,
        last_name: lastName
      });
    } else if (role === 'parent') {
      profile = await Parent.create({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName
      });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Save refresh token
    await user.update({ refresh_token: refreshToken });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { username, password } = value;

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Save refresh token
    await user.update({ refresh_token: refreshToken });

    // Get profile based on role
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'parent') {
      profile = await Parent.findOne({ where: { user_id: user.id } });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        profile,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refresh_token'] }
    });

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'parent') {
      profile = await Parent.findOne({ where: { user_id: user.id } });
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const { verifyRefreshToken } = require('../utils/generateToken');
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await user.update({ refresh_token: newRefreshToken });

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

