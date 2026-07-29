'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contacts', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(160),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      inquiry_type: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING(4000),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('contacts', ['email'], {
      name: 'idx_contacts_email',
    });
    await queryInterface.addIndex('contacts', ['created_at'], {
      name: 'idx_contacts_created',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contacts');
  },
};
