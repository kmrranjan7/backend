const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
  host: env.database.host,
  port: env.database.port,
  dialect: 'mysql',
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: env.database.pool.max,
    min: env.database.pool.min,
    acquire: env.database.pool.acquireMs,
    idle: env.database.pool.idleMs,
  },
});

module.exports = sequelize;
