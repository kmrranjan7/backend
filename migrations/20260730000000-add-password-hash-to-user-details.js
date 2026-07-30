'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_details', 'password_hash', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'mobile',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('user_details', 'password_hash');
  },
};
