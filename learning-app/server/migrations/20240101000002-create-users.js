'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('student', 'instructor', 'admin'),
        defaultValue: 'student',
        allowNull: false
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Organizations',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loginCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['organizationId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};