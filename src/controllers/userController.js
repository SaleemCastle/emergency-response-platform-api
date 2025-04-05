const prisma = require('../lib/prisma');

const userController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        include: {
          emergencies: true
        }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          emergencies: true
        }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const { email, name } = req.body;
      const user = await prisma.user.create({
        data: {
          email,
          name
        }
      });
      res.status(201).json(user);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, name } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: {
          email,
          name
        }
      });
      res.json(user);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await prisma.user.delete({
        where: { id }
      });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Get user ID by email
  async getUserIdByEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ userId: user.id });
    } catch (error) {
      console.error('Error in getUserIdByEmail:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Store user push token
  async storePushToken(req, res) {
    try {
      const { userId, pushToken } = req.body;

      if (!userId || !pushToken) {
        return res.status(400).json({ error: 'User ID and push token are required' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { pushToken }
      });

      res.status(200).json({ message: 'Push token stored successfully' });
    } catch (error) {
      console.error('Error in storePushToken:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController; 