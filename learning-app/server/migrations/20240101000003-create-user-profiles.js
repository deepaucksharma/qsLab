'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserProfiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {
          theme: 'light',
          emailNotifications: true,
          terminalTheme: 'default',
          fontSize: 14
        }
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: 'UTC'
      },
      linkedIn: {
        type: Sequelize.STRING,
        allowNull: true
      },
      github: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company: {
        type: Sequelize.STRING,
        allowNull: true
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: true
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserProfiles');
  }
};