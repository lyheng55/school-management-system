const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire, jwtRefreshSecret, jwtRefreshExpire } = require('../config/jwt');

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpire
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: jwtRefreshExpire
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtRefreshSecret);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};

