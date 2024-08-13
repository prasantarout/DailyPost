const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); // Ensure this path is correct

// Define the routes
router.post('/categories', categoryController.createCategory);
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.put('/updateCategories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;
