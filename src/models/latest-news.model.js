const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LatestNews = sequelize.define('LatestNews', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(180), allowNull: false },
  link: { type: DataTypes.STRING(500), allowNull: false },
}, {
  tableName: 'latest_news',
  timestamps: true,
});

module.exports = LatestNews;
