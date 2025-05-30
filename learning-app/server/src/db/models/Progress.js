const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      Progress.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  Progress.init({
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
    weekId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    exerciseId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'skipped'),
      defaultValue: 'not_started'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    submission: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Progress',
    tableName: 'Progress',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'weekId', 'exerciseId'],
        unique: true
      },
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      }
    ]
  });
  
  return Progress;
};