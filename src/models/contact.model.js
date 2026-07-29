const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define(
  'Contact',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    inquiryType: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(4000),
      allowNull: false,
    },
  },
  {
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      { name: 'idx_contacts_email', fields: ['email'] },
      { name: 'idx_contacts_created', fields: ['created_at'] },
    ],
  },
);

module.exports = Contact;
