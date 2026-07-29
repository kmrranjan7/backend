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
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'user_details',
    timestamps: true,
  },
);

module.exports = UserDetails;
