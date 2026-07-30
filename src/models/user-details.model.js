const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDetails = sequelize.define(
  'UserDetails',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'user_details',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
  },
);

UserDetails.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

module.exports = UserDetails;
