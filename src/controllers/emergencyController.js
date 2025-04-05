const prisma = require('../lib/prisma');
const SocketService = require('../services/socketService');
const { classifyEmergency } = require('../aiService');
const { sendPushNotifications } = require('../services/pushNotification');

const emergencyController = {
  // Get all emergencies
  async getAllEmergencies(req, res) {
    try {
      const emergencies = await prisma.emergency.findMany({
        include: {
          user: true
        }
      });
      res.json(emergencies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get emergency by ID
  async getEmergencyById(req, res) {
    try {
      const { id } = req.params;
      const emergency = await prisma.emergency.findUnique({
        where: { id },
        include: {
          user: true
        }
      });
      if (!emergency) {
        return res.status(404).json({ error: 'Emergency not found' });
      }
      res.json(emergency);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new emergency
  async createEmergency(req, res) {
    try {
      const { userId, location, description, expoPushToken } = req.body;

      console.log('Expo Push Token:', expoPushToken);
      
      // Get media URL if file was uploaded
      const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // Get AI classification with media analysis
    //   const { type, severity } = await classifyEmergency(description, mediaUrl);
      const { type, severity } = { type: 'test', severity: 1 };
      console.log('AI Classification:', { type, severity });

      const emergency = await prisma.emergency.create({
        data: {
          userId,
          type,
          location,
          description,
          mediaUrl,
          severity,
          hits: 0
        },
        include: {
          user: true
        }
      });

      // Get all user push tokens except the reporter's
      const users = await prisma.user.findMany({
        where: {
          pushToken: {
            not: null,
          },
          id: {
            not: userId
          }
        },
        select: {
          pushToken: true
        }
      });

      const pushTokens = users.map(user => user.pushToken);

      // Send notifications asynchronously - don't await
      sendPushNotifications(pushTokens, emergency)
        .catch(error => console.error('Failed to send notifications:', error));

      // Emit socket event if available
      if (global.io) {
        const socketService = new SocketService(global.io);
        socketService.emitNewEmergency({
          ...emergency,
          severity
        });
      }

      res.status(201).json({
        ...emergency,
        aiClassified: true,
        aiAnalysis: {
          type,
          severity
        }
      });
    } catch (error) {
      console.error('Error in createEmergency:', error);
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update emergency
  async updateEmergency(req, res) {
    try {
      const { id } = req.params;
      const { type, location, description, photoUrl, status } = req.body;
      const emergency = await prisma.emergency.update({
        where: { id },
        data: {
          type,
          location,
          description,
          photoUrl,
          status
        },
        include: {
          user: true
        }
      });
      res.json(emergency);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Emergency not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Delete emergency
  async deleteEmergency(req, res) {
    try {
      const { id } = req.params;
      await prisma.emergency.delete({
        where: { id }
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Emergency not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Get emergencies by user ID
  async getUserEmergencies(req, res) {
    try {
      const { userId } = req.params;
      const emergencies = await prisma.emergency.findMany({
        where: { userId },
        include: {
          user: true
        }
      });
      res.json(emergencies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Confirm emergency
  async confirmEmergency(req, res) {
    try {
      const { id } = req.params;
      const emergency = await prisma.emergency.update({
        where: { id },
        data: {
          hits: {
            increment: 1
          }
        },
        include: {
          user: true
        }
      });

      if (global.io) {
        const socketService = new SocketService(global.io);
        socketService.emitEmergencyConfirmation({
          emergencyId: id,
          hits: emergency.hits
        });
      }

      res.json(emergency);
    } catch (error) {
      console.error('Error in confirmEmergency:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Emergency not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Get emergencies sorted by hits
  async getTrendingEmergencies(req, res) {
    try {
      const emergencies = await prisma.emergency.findMany({
        where: {
          status: 'pending', // Only get active emergencies
          timestamp: {
            // Only get emergencies from the last 24 hours
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          hits: 'desc'
        },
        include: {
          user: true
        },
        take: 10 // Limit to top 10
      });
      res.json(emergencies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = emergencyController; 