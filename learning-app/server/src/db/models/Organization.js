const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(models) {
      Organization.hasMany(models.User, {
        foreignKey: 'organizationId',
        as: 'users'
      });
    }
  }
  
  Organization.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        ssoEnabled: false,
        ssoProvider: null,
        maxUsers: null,
        features: ['basic']
      }
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
    modelName: 'Organization',
    tableName: 'Organizations',
    timestamps: true,
    indexes: [
      {
        fields: ['slug']
      },
      {
        fields: ['domain']
      }
    ]
  });
  
  return Organization;
};