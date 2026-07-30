'use strict';

const basePostTypes = [
  'JOB',
  'ADMIT',
  'EXAM',
  'RESULT',
  'ADMISSION',
  'SYLLABUS',
  'ANSWER_KEY',
];

async function changePostTypeEnum(queryInterface, Sequelize, values) {
  await queryInterface.changeColumn('posts', 'post_type', {
    type: Sequelize.ENUM(...values),
    allowNull: false,
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await changePostTypeEnum(queryInterface, Sequelize, [...basePostTypes, 'OTHER', 'OTHERS']);
    await queryInterface.sequelize.query(
      "UPDATE `posts` SET `post_type` = 'OTHERS' WHERE `post_type` = 'OTHER'",
    );
    await changePostTypeEnum(queryInterface, Sequelize, [...basePostTypes, 'OTHERS']);
  },

  async down(queryInterface, Sequelize) {
    await changePostTypeEnum(queryInterface, Sequelize, [...basePostTypes, 'OTHER', 'OTHERS']);
    await queryInterface.sequelize.query(
      "UPDATE `posts` SET `post_type` = 'OTHER' WHERE `post_type` = 'OTHERS'",
    );
    await changePostTypeEnum(queryInterface, Sequelize, [...basePostTypes, 'OTHER']);
  },
};
