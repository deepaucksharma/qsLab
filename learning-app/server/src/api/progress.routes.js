const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { Progress } = require('../db/models');
const RedisService = require('../services/RedisService');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get progress for a specific week/exercise
router.get('/:weekId/:exerciseId', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;
    
    const progress = await Progress.findOne({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      }
    });

    if (!progress) {
      // Return default progress if not found
      return res.json({
        progress: {
          userId: req.user.id,
          weekId,
          exerciseId,
          status: 'not_started',
          score: null,
          timeSpent: 0,
          attempts: 0
        }
      });
    }

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start an exercise
router.post('/:weekId/:exerciseId/start', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;
    
    const [progress, created] = await Progress.findOrCreate({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      },
      defaults: {
        status: 'in_progress',
        startedAt: new Date(),
        attempts: 1
      }
    });

    if (!created && progress.status === 'not_started') {
      await progress.update({
        status: 'in_progress',
        startedAt: new Date(),
        attempts: progress.attempts + 1
      });
    }

    // Track in Redis for real-time updates
    await RedisService.setCache(
      `progress:${req.user.id}:${weekId}:${exerciseId}`,
      {
        status: 'in_progress',
        startedAt: new Date()
      },
      3600 // 1 hour cache
    );

    res.json({ 
      message: 'Exercise started',
      progress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit exercise solution
router.post('/:weekId/:exerciseId/submit', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  body('submission').notEmpty(),
  body('timeSpent').optional().isInt({ min: 0 }),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;
    const { submission, timeSpent } = req.body;

    // Find or create progress
    const [progress, created] = await Progress.findOrCreate({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      },
      defaults: {
        status: 'in_progress',
        startedAt: new Date()
      }
    });

    // Validate submission (simplified for now)
    const validationResult = await validateSubmission(weekId, exerciseId, submission);
    
    // Update progress
    await progress.update({
      status: validationResult.passed ? 'completed' : 'in_progress',
      score: validationResult.score,
      completedAt: validationResult.passed ? new Date() : null,
      timeSpent: (progress.timeSpent || 0) + (timeSpent || 0),
      attempts: progress.attempts + 1,
      submission: submission,
      feedback: validationResult.feedback
    });

    // Clear cache
    await RedisService.invalidateCache(`progress:${req.user.id}:${weekId}:${exerciseId}`);

    res.json({
      message: 'Submission received',
      result: validationResult,
      progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update time spent (for tracking active time)
router.put('/:weekId/:exerciseId/time', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  body('timeSpent').isInt({ min: 0 }),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;
    const { timeSpent } = req.body;

    const progress = await Progress.findOne({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    await progress.update({
      timeSpent: (progress.timeSpent || 0) + timeSpent
    });

    res.json({ 
      message: 'Time updated',
      totalTimeSpent: progress.timeSpent 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Skip an exercise
router.post('/:weekId/:exerciseId/skip', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;

    const [progress, created] = await Progress.findOrCreate({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      },
      defaults: {
        status: 'skipped'
      }
    });

    if (!created) {
      await progress.update({ status: 'skipped' });
    }

    res.json({ 
      message: 'Exercise skipped',
      progress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset progress for an exercise
router.delete('/:weekId/:exerciseId', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;

    const progress = await Progress.findOne({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      }
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    await progress.destroy();

    // Clear cache
    await RedisService.invalidateCache(`progress:${req.user.id}:${weekId}:${exerciseId}`);

    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hints for an exercise
router.get('/:weekId/:exerciseId/hints', authenticate, [
  param('weekId').notEmpty(),
  param('exerciseId').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { weekId, exerciseId } = req.params;
    
    // Track hint usage
    const progress = await Progress.findOne({
      where: {
        userId: req.user.id,
        weekId,
        exerciseId
      }
    });

    if (progress) {
      const metadata = progress.metadata || {};
      metadata.hintsUsed = (metadata.hintsUsed || 0) + 1;
      metadata.lastHintAt = new Date();
      await progress.update({ metadata });
    }

    // Get hints (simplified - in production, load from exercise definitions)
    const hints = getHintsForExercise(weekId, exerciseId);
    
    res.json({ hints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function validateSubmission(weekId, exerciseId, submission) {
  // Simplified validation - in production, this would check against exercise requirements
  const validations = {
    'week1': {
      'exercise1': (sub) => {
        const score = Math.random() * 100; // Simulate scoring
        return {
          passed: score >= 70,
          score: Math.round(score),
          feedback: score >= 70 ? 'Great job!' : 'Keep trying, you\'re almost there!'
        };
      }
    }
  };

  const validator = validations[weekId]?.[exerciseId];
  if (validator) {
    return validator(submission);
  }

  // Default validation
  return {
    passed: true,
    score: 100,
    feedback: 'Exercise completed successfully!'
  };
}

function getHintsForExercise(weekId, exerciseId) {
  // Simplified hint system - in production, load from database
  const hints = {
    'week1': {
      'exercise1': [
        'Check the Kafka broker logs for connection issues',
        'Make sure the topic has been created before consuming',
        'Verify the consumer group ID is correct'
      ]
    }
  };

  return hints[weekId]?.[exerciseId] || ['No hints available for this exercise'];
}

module.exports = router;