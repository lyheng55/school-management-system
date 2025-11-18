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
    const MAX_LOGIN_ATTEMPTS = 5;

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      // Don't reveal if user exists for security (prevent username enumeration)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.is_locked) {
      return res.status(401).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Please contact an administrator to unlock your account.'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account
        await user.update({
          login_attempts: newAttempts,
          is_locked: true,
          locked_at: new Date()
        });
        
        return res.status(401).json({
          success: false,
          message: 'Account has been locked due to too many failed login attempts. Please contact an administrator to unlock your account.'
        });
      } else {
        // Update login attempts
        await user.update({ login_attempts: newAttempts });
        
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
        return res.status(401).json({
          success: false,
          message: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`
        });
      }
    }

    // Successful login - reset login attempts and update last login
    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Update user: reset login attempts, unlock account, update last login, and save refresh token
    await user.update({
      last_login: new Date(),
      login_attempts: 0,
      is_locked: false,
      locked_at: null,
      refresh_token: refreshToken
    });

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

const unlockUserSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
});

exports.unlockUser = async (req, res) => {
  try {
    const { error, value } = unlockUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { userId } = value;

    // Find the user to unlock
    const userToUnlock = await User.findByPk(userId);
    if (!userToUnlock) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is actually locked
    if (!userToUnlock.is_locked) {
      return res.status(400).json({
        success: false,
        message: 'User account is not locked'
      });
    }

    // Unlock the account and reset login attempts
    await userToUnlock.update({
      is_locked: false,
      locked_at: null,
      login_attempts: 0
    });

    res.json({
      success: true,
      message: 'User account unlocked successfully',
      data: {
        user: {
          id: userToUnlock.id,
          username: userToUnlock.username,
          email: userToUnlock.email,
          role: userToUnlock.role
        }
      }
    });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unlocking user account',
      error: error.message
    });
  }
};

