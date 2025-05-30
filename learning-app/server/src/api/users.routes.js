const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { User, UserProfile, Progress } = require('../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken'] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('displayName').optional().trim().isLength({ min: 2 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('bio').optional().trim(),
  body('company').optional().trim(),
  body('jobTitle').optional().trim(),
  body('linkedIn').optional().isURL(),
  body('github').optional().trim(),
  body('timezone').optional().trim(),
  validate
], async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await profile.update(req.body);

    res.json({ 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update preferences
router.put('/preferences', authenticate, [
  body('theme').optional().isIn(['light', 'dark']),
  body('emailNotifications').optional().isBoolean(),
  body('terminalTheme').optional().trim(),
  body('fontSize').optional().isInt({ min: 10, max: 24 }),
  validate
], async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const preferences = {
      ...profile.preferences,
      ...req.body
    };

    await profile.update({ preferences });

    res.json({ 
      message: 'Preferences updated successfully',
      preferences 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress summary
router.get('/progress', authenticate, async (req, res) => {
  try {
    const progress = await Progress.findAll({
      where: { userId: req.user.id },
      order: [['weekId', 'ASC'], ['exerciseId', 'ASC']]
    });

    // Calculate summary statistics
    const summary = {
      totalExercises: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in_progress').length,
      averageScore: 0,
      totalTimeSpent: 0,
      weekProgress: {}
    };

    // Group by week
    progress.forEach(p => {
      if (!summary.weekProgress[p.weekId]) {
        summary.weekProgress[p.weekId] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          averageScore: 0,
          timeSpent: 0
        };
      }

      const week = summary.weekProgress[p.weekId];
      week.total++;
      if (p.status === 'completed') {
        week.completed++;
        summary.averageScore += p.score || 0;
      } else if (p.status === 'in_progress') {
        week.inProgress++;
      }
      week.timeSpent += p.timeSpent;
      summary.totalTimeSpent += p.timeSpent;
    });

    // Calculate averages
    const completedCount = summary.completed;
    if (completedCount > 0) {
      summary.averageScore = Math.round(summary.averageScore / completedCount);
    }

    res.json({ 
      summary,
      progress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { weekId, limit = 10 } = req.query;

    let whereClause = {};
    if (weekId) {
      whereClause.weekId = weekId;
    }

    // Get top users by score
    const leaderboard = await Progress.findAll({
      where: {
        ...whereClause,
        status: 'completed'
      },
      attributes: [
        'userId',
        [Progress.sequelize.fn('AVG', Progress.sequelize.col('score')), 'averageScore'],
        [Progress.sequelize.fn('COUNT', Progress.sequelize.col('id')), 'completedExercises'],
        [Progress.sequelize.fn('SUM', Progress.sequelize.col('timeSpent')), 'totalTime']
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email'],
        include: [{
          model: UserProfile,
          as: 'profile',
          attributes: ['displayName', 'avatarUrl']
        }]
      }],
      group: ['Progress.userId', 'user.id', 'user->profile.id'],
      order: [[Progress.sequelize.fn('AVG', Progress.sequelize.col('score')), 'DESC']],
      limit: parseInt(limit)
    });

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      user: entry.user,
      stats: {
        averageScore: parseFloat(entry.get('averageScore')) || 0,
        completedExercises: parseInt(entry.get('completedExercises')) || 0,
        totalTime: parseInt(entry.get('totalTime')) || 0
      }
    }));

    // Find current user's rank
    const userRank = rankedLeaderboard.findIndex(entry => entry.userId === req.user.id) + 1;

    res.json({ 
      leaderboard: rankedLeaderboard,
      userRank: userRank || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, organizationId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { '$profile.displayName$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: UserProfile,
        as: 'profile',
        attributes: ['displayName', 'company', 'jobTitle']
      }],
      attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
router.put('/:userId', authenticate, authorize('admin'), [
  body('role').optional().isIn(['student', 'instructor', 'admin']),
  body('isActive').optional().isBoolean(),
  body('organizationId').optional().isUUID(),
  validate
], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update(req.body);

    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - just deactivate
    await user.update({ isActive: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;