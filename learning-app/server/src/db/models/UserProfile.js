const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      UserProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  UserProfile.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: 'light',
        emailNotifications: true,
        terminalTheme: 'default',
        fontSize: 14
      }
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    linkedIn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    github: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'UserProfiles',
    timestamps: true
  });
  
  return UserProfile;
};