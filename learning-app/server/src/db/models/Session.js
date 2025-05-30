const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  Session.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'Sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['token']
      },
      {
        fields: ['refreshToken']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });
  
  return Session;
};