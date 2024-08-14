// src/routes/index.js
const express = require('express');
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const categoryRoutes = require('./categoryRoutes');
const favoriteRoutes = require('./favoritesRoutes');
// Import other routes here as needed

const router = express.Router();

// Define routes
router.use('/auth', userRoutes);
router.use('/post', postRoutes);
router.use('/category', categoryRoutes);
router.use('/favorite', favoriteRoutes);
// Export the router
module.exports = router;
