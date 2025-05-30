'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
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
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      refreshToken: {
        type: Sequelize.STRING(500),
        allowNull: true,
        unique: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      lastActivity: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      deviceInfo: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addIndex('Sessions', ['token']);
    await queryInterface.addIndex('Sessions', ['refreshToken']);
    await queryInterface.addIndex('Sessions', ['userId']);
    await queryInterface.addIndex('Sessions', ['expiresAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sessions');
  }
};