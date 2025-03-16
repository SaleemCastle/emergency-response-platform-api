const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// GET all emergencies
router.get('/', emergencyController.getAllEmergencies);

// GET emergency by ID
router.get('/:id', emergencyController.getEmergencyById);

// GET emergencies by user ID
router.get('/user/:userId', emergencyController.getUserEmergencies);

// POST new emergency
router.post('/', emergencyController.createEmergency);

// PUT update emergency
router.put('/:id', emergencyController.updateEmergency);

// DELETE emergency
router.delete('/:id', emergencyController.deleteEmergency);

// POST confirm emergency
router.post('/:id/confirm', emergencyController.confirmEmergency);

// GET trending emergencies
router.get('/trending', emergencyController.getTrendingEmergencies);

module.exports = router; 