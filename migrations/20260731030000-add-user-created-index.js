'use strict';

const INDEX_NAME = 'idx_user_details_created';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('user_details', ['created_at'], {
      name: INDEX_NAME,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('user_details', INDEX_NAME);
  },
};
