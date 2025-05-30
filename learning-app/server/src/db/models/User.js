const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.UserProfile, {
        foreignKey: 'userId',
        as: 'profile'
      });
      User.hasMany(models.Session, {
        foreignKey: 'userId',
        as: 'sessions'
      });
      User.hasMany(models.Progress, {
        foreignKey: 'userId',
        as: 'progress'
      });
      User.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
      });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('student', 'instructor', 'admin'),
      defaultValue: 'student',
      allowNull: false
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Organizations',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['organizationId']
      }
    ]
  });
  
  return User;
};