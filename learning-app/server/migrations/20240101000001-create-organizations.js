'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      domain: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          ssoEnabled: false,
          ssoProvider: null,
          maxUsers: null,
          features: ['basic']
        }
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

    await queryInterface.addIndex('Organizations', ['slug']);
    await queryInterface.addIndex('Organizations', ['domain']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Organizations');
  }
};