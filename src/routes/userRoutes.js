const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const userController = require('../controllers/userController');

// GET all users
router.get('/', requireAuth(), userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// POST new user
router.post('/', userController.createUser);

// PUT update user
router.put('/:id', userController.updateUser);

// DELETE user
router.delete('/:id', userController.deleteUser);

// Get user ID by email
router.get('/user/email/:email', userController.getUserIdByEmail);

// Store user push token
router.post('/user/push-token', userController.storePushToken);

module.exports = router; 