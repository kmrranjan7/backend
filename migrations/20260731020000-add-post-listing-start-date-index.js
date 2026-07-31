'use strict';

const INDEX_NAME = 'idx_posts_type_status_start_date';
const OLD_INDEX_NAME = 'idx_posts_type_status_created';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeIndex('posts', OLD_INDEX_NAME);
    await queryInterface.addIndex(
      'posts',
      ['post_type', 'post_status', 'start_date'],
      { name: INDEX_NAME },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('posts', INDEX_NAME);
    await queryInterface.addIndex(
      'posts',
      ['post_type', 'post_status', 'created_at'],
      { name: OLD_INDEX_NAME },
    );
  },
};
