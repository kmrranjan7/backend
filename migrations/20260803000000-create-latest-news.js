'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('latest_news', {
      id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING(180), allowNull: false },
      link: { type: Sequelize.STRING(500), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('latest_news');
  },
};
