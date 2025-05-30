'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Progress', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      weekId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exerciseId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed', 'skipped'),
        defaultValue: 'not_started'
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      submission: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Progress', ['userId', 'weekId', 'exerciseId'], {
      unique: true
    });
    await queryInterface.addIndex('Progress', ['userId']);
    await queryInterface.addIndex('Progress', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Progress');
  }
};