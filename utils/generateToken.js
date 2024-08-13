const jwt = require('jsonwebtoken');
const {jwtSecret}=require('../config')

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d', // Set the expiry time as needed
  });
};

module.exports = generateToken;